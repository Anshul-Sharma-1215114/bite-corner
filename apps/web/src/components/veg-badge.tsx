export function VegBadge({ isVeg, size = "md" }: { isVeg: boolean; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const color = isVeg ? "border-green-600" : "border-red-600";
  const dotColor = isVeg ? "bg-green-600" : "bg-red-600";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-sm border ${box} ${color}`} title={isVeg ? "Vegetarian" : "Non-vegetarian"}>
      <span className={`rounded-full ${dot} ${dotColor}`} />
    </span>
  );
}
