import { Minus, Plus } from "lucide-react";

export function QuantityStepper({ quantity, onChange, min = 0 }: { quantity: number; onChange: (next: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-full border-2 border-red-300 bg-white px-1 shadow-soft">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 active:scale-90 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-4 text-center text-sm font-bold">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 active:scale-90"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
