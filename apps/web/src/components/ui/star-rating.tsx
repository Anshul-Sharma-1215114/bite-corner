import { Star } from "lucide-react";

const SIZE_CLASSES = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

interface StarRatingProps {
  rating: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

export function StarRating({ rating, onChange, size = "md", readOnly = false }: StarRatingProps) {
  const interactive = Boolean(onChange) && !readOnly;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= rating;
        const star = <Star className={`${SIZE_CLASSES[size]} ${filled ? "fill-yellow-400 text-yellow-500" : "text-ink/20"}`} />;
        if (!interactive) return <span key={n} aria-hidden="true">{star}</span>;
        return (
          <button key={n} type="button" aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange?.(n)} className="transition active:scale-90">
            {star}
          </button>
        );
      })}
    </div>
  );
}
