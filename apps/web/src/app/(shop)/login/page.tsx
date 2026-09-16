"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "@/components/logo-mark";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await apiFetch<{ devCode?: string }>("/api/auth/customer/otp/request", { method: "POST", body: JSON.stringify({ phone }) });
      setDevCode(data.devCode ?? null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/customer/otp/verify", { method: "POST", body: JSON.stringify({ phone, code, name: name || undefined }) });
      await refresh();
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to verify OTP");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <main className="flex items-center justify-center py-24">
        <p className="text-ink/50">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col justify-center gap-6 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMark className="h-14 w-14" />
        <h1 className="font-display text-2xl font-bold text-red-600">Log in to Bite Corner</h1>
      </div>

      <Card>
        {step === "phone" ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Phone number
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="rounded-lg border border-ink/15 px-4 py-2 focus:border-red-400 focus:outline-none" />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={submitting}>{submitting ? "Sending..." : "Send OTP"}</Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            {devCode && (
              <p className="rounded-lg bg-yellow-100 px-4 py-2 text-sm text-yellow-900">
                Dev mode: your OTP is <span className="font-mono font-semibold">{devCode}</span>
              </p>
            )}
            <label className="flex flex-col gap-1 text-sm">
              Your name (first time only)
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" className="rounded-lg border border-ink/15 px-4 py-2 focus:border-red-400 focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Enter 4-digit OTP
              <input type="text" required maxLength={4} value={code} onChange={(e) => setCode(e.target.value)} className="rounded-lg border border-ink/15 px-4 py-2 tracking-widest focus:border-red-400 focus:outline-none" />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={submitting}>{submitting ? "Verifying..." : "Verify & continue"}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep("phone")}>Change phone number</Button>
          </form>
        )}
      </Card>
    </main>
  );
}
