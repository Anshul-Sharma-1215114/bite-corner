import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-red-500">
        <SearchX className="h-8 w-8" />
      </span>
      <h1 className="font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink/60">The page you're looking for doesn't exist.</p>
      <ButtonLink href="/">Back to Bite Corner</ButtonLink>
    </main>
  );
}
