import type { OrderStatus, OrderType } from "@bite-corner/shared";
import { Check, XCircle } from "lucide-react";

const DELIVERY_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PLACED", label: "Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

const PICKUP_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PLACED", label: "Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY_FOR_PICKUP", label: "Ready" },
  { status: "COMPLETED", label: "Completed" },
];

export function OrderStatusStepper({ type, status }: { type: OrderType; status: OrderStatus }) {
  if (status === "CANCELLED" || status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        This order was {status === "CANCELLED" ? "cancelled" : "rejected"}.
      </div>
    );
  }

  const steps = type === "DELIVERY" ? DELIVERY_STEPS : PICKUP_STEPS;
  const currentIndex = steps.findIndex((s) => s.status === status);

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const reached = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.status} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  reached ? "bg-red-500 text-white" : "bg-ink/10 text-transparent"
                } ${isCurrent ? "animate-pulse ring-4 ring-yellow-200" : ""}`}
              >
                {reached && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </div>
              <span className={`text-[10px] font-bold ${reached ? "text-red-700" : "text-ink/40"}`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              // mt-[10px] centers this on the h-6 circle above (half of 24px, minus
              // half the bar's own 4px height) regardless of whether this step's
              // label wraps to one or two lines — items-start on the row above
              // means this no longer gets centered against the taller column.
              <div className={`mx-1 mt-[10px] h-1 flex-1 rounded-full transition-colors duration-500 ${i < currentIndex ? "bg-red-500" : "bg-ink/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
