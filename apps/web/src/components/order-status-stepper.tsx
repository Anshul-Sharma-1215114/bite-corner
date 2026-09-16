import { Fragment } from "react";
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
    // Labels are pulled out of the flex row entirely (absolutely positioned
    // below their circle) so a long label like "Out for delivery" can never
    // eat into a connector's width — every connector is a plain flex-1
    // sibling of fixed-size circles, so they're always equal, continuous
    // segments of one line. pb-9 reserves room for the labels underneath.
    <div className="relative pb-9">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const reached = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const isFirst = i === 0;
          const isLast = i === steps.length - 1;
          return (
            <Fragment key={step.status}>
              <div className="relative shrink-0">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                    reached ? "bg-red-500 text-white" : "bg-ink/10 text-transparent"
                  } ${isCurrent ? "animate-pulse ring-4 ring-yellow-200" : ""}`}
                >
                  {reached && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </div>
                <span
                  className={`absolute top-full mt-1.5 w-16 text-center text-[10px] font-bold leading-tight ${reached ? "text-red-700" : "text-ink/40"} ${
                    isFirst ? "left-0 text-left" : isLast ? "right-0 text-right" : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`mx-1 h-1 flex-1 rounded-full transition-colors duration-500 ${i < currentIndex ? "bg-red-500" : "bg-ink/10"}`} />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
