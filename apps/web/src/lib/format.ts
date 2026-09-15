export function formatInr(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
