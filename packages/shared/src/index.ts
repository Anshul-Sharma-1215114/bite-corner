export type Role = "CUSTOMER" | "ADMIN" | "DELIVERY_AGENT";

export type AddressLabel = "HOME" | "WORK" | "OTHER";

export type OrderType = "DELIVERY" | "TAKEAWAY" | "DINE_IN";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

// Only COD and a manually-confirmed UPI QR today — no payment gateway wired
// up. A third value (e.g. "GATEWAY") can be added later without
// restructuring the Order model.
export type PaymentMethod = "COD" | "UPI_MANUAL";

export type PaymentStatus = "UNPAID" | "PAID";

export type CouponType = "FLAT" | "PERCENT";

// Single source of truth for legal order-status transitions — enforced by
// the server and used to drive the admin UI's status dropdown, so the two
// can't drift apart.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

// The only statuses a delivery agent may set themselves — they physically
// hold the order, so they're the ones who know when it's picked up and
// dropped off, not the admin sitting at the dashboard.
export const AGENT_SETTABLE_STATUSES = new Set<OrderStatus>(["OUT_FOR_DELIVERY", "DELIVERED"]);

// READY_FOR_PICKUP is a dead end for DELIVERY orders (they need
// OUT_FOR_DELIVERY -> DELIVERED instead), so it's filtered out of the legal
// next-steps list for delivery orders to avoid stranding an order there.
//
// For an ADMIN acting on a DELIVERY order, OUT_FOR_DELIVERY is further
// filtered out — once an agent is assigned, marking an order "out for
// delivery" is their call to make (they're the one actually picking it
// up), not something the admin should be able to trigger remotely at the
// same time through a second, redundant control.
export function getNextOrderStatuses(current: OrderStatus, orderType: OrderType, role: Role = "ADMIN"): OrderStatus[] {
  const next = ORDER_STATUS_TRANSITIONS[current];
  const legal = orderType === "DELIVERY" ? next.filter((s) => s !== "READY_FOR_PICKUP") : next;
  if (role === "DELIVERY_AGENT") return legal.filter((s) => AGENT_SETTABLE_STATUSES.has(s));
  if (orderType === "DELIVERY") return legal.filter((s) => s !== "OUT_FOR_DELIVERY");
  return legal;
}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  phone?: string | null;
  email?: string | null;
}
