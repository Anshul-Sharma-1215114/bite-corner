import { ChevronLeft, ChevronRight } from "lucide-react";

// A matched pair of round prev/next controls — one soft outline, one solid
// — reused everywhere a horizontal carousel appears (hero, popular items,
// related items) so the interaction pattern reads as one consistent system.
export function CarouselArrows({
  onPrev,
  onNext,
  variant = "light",
  className = "",
}: {
  onPrev: () => void;
  onNext: () => void;
  variant?: "light" | "dark";
  className?: string;
}) {
  const outline = variant === "light" ? "border-2 border-white text-white hover:bg-white/10" : "border-2 border-ink/15 text-ink hover:bg-black/5";
  const solid = variant === "light" ? "bg-white text-red-600 hover:bg-white/90" : "bg-ink text-white hover:bg-ink/90";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className={`flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 ${outline}`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-soft transition active:scale-90 ${solid}`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
