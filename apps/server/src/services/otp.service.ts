import { prisma } from "../utils/prisma";
import { env, isProd } from "../config/env";

const REQUEST_COOLDOWN_MS = 30_000;
const MAX_VERIFY_ATTEMPTS = 5;

const lastRequestAt = new Map<string, number>();
const verifyAttempts = new Map<string, number>();

export class OtpRateLimitError extends Error {}

// Mock provider — just logs the code. Swap this module for a real
// SMS provider (MSG91/Twilio) later; same two-function interface.
async function consoleOtpProvider(phone: string, code: string): Promise<void> {
  console.log(`[OTP] ${phone} -> ${code}`);
}

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
  await consoleOtpProvider(phone, code);

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
