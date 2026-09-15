"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="font-display text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink/60">An unexpected error occurred. You can try again, or head back to the homepage.</p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">Back to Bite Corner</ButtonLink>
      </div>
    </main>
  );
}
