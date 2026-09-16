import { prisma } from "../utils/prisma";
import { env, isProd } from "../config/env";

const REQUEST_COOLDOWN_MS = 30_000;
const MAX_VERIFY_ATTEMPTS = 5;

const lastRequestAt = new Map<string, number>();
const verifyAttempts = new Map<string, number>();

export class OtpRateLimitError extends Error {}

// Fallback provider — just logs the code. Used whenever the WhatsApp
// Cloud API isn't configured (local dev), so OTP login still works
// without needing a Meta Business setup.
async function consoleOtpProvider(phone: string, code: string): Promise<void> {
  console.log(`[OTP] ${phone} -> ${code}`);
}

// WhatsApp Cloud API doesn't accept a leading "+" and expects the full
// international number. Phone numbers are collected as bare 10-digit
// local numbers (see the login form), so prepend the shop's country code
// unless one's already present.
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `${env.WHATSAPP_DEFAULT_COUNTRY_CODE}${digits}`;
  return digits;
}

// Sends the OTP via an approved WhatsApp "Authentication" template using
// Meta's own Cloud API directly — no third-party SMS/WhatsApp aggregator,
// and free for reasonable volume (Meta's monthly free conversation tier).
// Requires WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID; falls back to
// the console provider when unset (local dev).
async function whatsappOtpProvider(phone: string, code: string): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toWhatsAppNumber(phone),
      type: "template",
      template: {
        name: env.WHATSAPP_OTP_TEMPLATE_NAME,
        language: { code: env.WHATSAPP_OTP_TEMPLATE_LANG },
        // Matches Meta's standard one-variable OTP body ("Your code is
        // {{1}}"). If your approved template also has a "Copy Code"
        // button, add a matching button component here too — see
        // https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates
        components: [{ type: "body", parameters: [{ type: "text", text: code }] }],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[WhatsApp OTP] send failed (${res.status}):`, body);
    // Still log the code so the request doesn't leave the customer
    // completely stuck if WhatsApp delivery fails.
    await consoleOtpProvider(phone, code);
  }
}

const otpProvider = env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID ? whatsappOtpProvider : consoleOtpProvider;

export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const last = lastRequestAt.get(phone);
  if (last && Date.now() - last < REQUEST_COOLDOWN_MS) {
    throw new OtpRateLimitError("Please wait before requesting another OTP.");
  }
  lastRequestAt.set(phone, Date.now());
  verifyAttempts.set(phone, 0);

  const code = String(Math.floor(1000 + Math.random() * 9000));
  await prisma.otpCode.create({
    data: { phone, code, expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000) },
  });
  await otpProvider(phone, code);

  return isProd ? {} : { devCode: code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const attempts = verifyAttempts.get(phone) ?? 0;
  if (attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new OtpRateLimitError("Too many attempts. Please request a new OTP.");
  }

  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    verifyAttempts.set(phone, attempts + 1);
    return false;
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
  verifyAttempts.set(phone, 0);
  return true;
}
