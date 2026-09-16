"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@bite-corner/shared";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "@/components/logo-mark";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StaffLoginForm({ title, redirectTo, role }: { title: string; redirectTo: string; role: Role }) {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  // router.replace (not push) so this form doesn't linger in browser
  // history behind the dashboard it redirects to.
  useEffect(() => {
    if (!loading && user?.role === role) router.replace(redirectTo);
  }, [loading, user, role, redirectTo, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/staff/login", { method: "POST", body: JSON.stringify({ email, password }) });
      await refresh();
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user?.role === role) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink/50">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMark className="h-14 w-14" />
        <h1 className="font-display text-2xl font-bold text-red-600">{title}</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-ink/15 px-4 py-2 focus:border-red-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-ink/15 px-4 py-2 focus:border-red-400 focus:outline-none"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
