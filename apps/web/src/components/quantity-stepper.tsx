import { Minus, Plus } from "lucide-react";

export function QuantityStepper({ quantity, onChange, min = 0 }: { quantity: number; onChange: (next: number) => void; min?: number }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-red-300 bg-white px-0.5 shadow-soft sm:gap-2 sm:px-1">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= min}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 active:scale-90 disabled:opacity-30 sm:h-7 sm:w-7"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
      <span className="w-3.5 text-center text-xs font-bold sm:w-4 sm:text-sm">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 active:scale-90 sm:h-7 sm:w-7"
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
    </div>
  );
}
