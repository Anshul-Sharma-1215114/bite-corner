import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { signAuthToken } from "../utils/jwt";
import { COOKIE_NAME } from "../middleware/auth";
import { isProd } from "../config/env";
import { requestOtp, verifyOtp, OtpRateLimitError } from "../services/otp.service";
import { assertNotLocked, recordFailedAttempt, clearAttempts, LoginRateLimitError } from "../services/login-rate-limit.service";

// Frontend (Vercel) and API (Render) live on different domains in
// production, so the auth cookie must be SameSite=None to be sent on
// cross-site fetches — which in turn requires Secure (HTTPS-only, true
// for both hosts in prod). Local/LAN dev keeps Lax since everything
// there shares a hostname (see apps/web/src/lib/api-url.ts).
const cookieOptions = {
  httpOnly: true,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const otpRequestSchema = z.object({ phone: z.string().min(10).max(15) });

export async function requestCustomerOtp(req: Request, res: Response) {
  const { phone } = otpRequestSchema.parse(req.body);
  try {
    const result = await requestOtp(phone);
    res.json(result);
  } catch (err) {
    if (err instanceof OtpRateLimitError) return res.status(429).json({ error: err.message });
    throw err;
  }
}

const otpVerifySchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(4),
  name: z.string().min(1).optional(),
});

export async function verifyCustomerOtp(req: Request, res: Response) {
  const { phone, code, name } = otpVerifySchema.parse(req.body);

  let valid: boolean;
  try {
    valid = await verifyOtp(phone, code);
  } catch (err) {
    if (err instanceof OtpRateLimitError) return res.status(429).json({ error: err.message });
    throw err;
  }
  if (!valid) return res.status(400).json({ error: "Invalid or expired OTP" });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone, name: name ?? "Customer", role: "CUSTOMER" } });
  }
  if (user.isBlocked) return res.status(403).json({ error: "This account has been blocked" });

  const token = signAuthToken({ id: user.id, role: user.role });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
}

const staffLoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export async function staffLogin(req: Request, res: Response) {
  const { email, password } = staffLoginSchema.parse(req.body);
  const rateLimitKey = `staff-login:${email}`;

  try {
    assertNotLocked(rateLimitKey);
  } catch (err) {
    if (err instanceof LoginRateLimitError) return res.status(429).json({ error: err.message });
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { email }, include: { deliveryAgentProfile: true } });

  if (!user || !user.passwordHash || user.role === "CUSTOMER") {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (user.isBlocked) return res.status(403).json({ error: "This account has been blocked" });
  if (user.role === "DELIVERY_AGENT" && user.deliveryAgentProfile?.isActive === false) {
    return res.status(403).json({ error: "This account has been deactivated" });
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  clearAttempts(rateLimitKey);
  const token = signAuthToken({ id: user.id, role: user.role });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role } });
}
