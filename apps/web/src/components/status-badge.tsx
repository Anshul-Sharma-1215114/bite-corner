import { CheckCircle2, XCircle, Clock, ChefHat, Bike, type LucideIcon } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
  PLACED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-orange-100 text-orange-700",
  PREPARING: "bg-orange-100 text-orange-700",
  READY_FOR_PICKUP: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-700",
};

const STATUS_ICONS: Record<string, LucideIcon> = {
  DELIVERED: CheckCircle2,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  REJECTED: XCircle,
  PLACED: Clock,
  CONFIRMED: ChefHat,
  PREPARING: ChefHat,
  READY_FOR_PICKUP: Bike,
  OUT_FOR_DELIVERY: Bike,
};

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[status] ?? "bg-ink/10 text-ink/60"} ${className}`}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {status.replace(/_/g, " ")}
    </span>
  );
}
