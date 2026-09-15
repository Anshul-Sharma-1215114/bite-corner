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

// READY_FOR_PICKUP is a dead end for DELIVERY orders (they need
// OUT_FOR_DELIVERY -> DELIVERED instead), so it's filtered out of the legal
// next-steps list for delivery orders to avoid stranding an order there.
export function getNextOrderStatuses(current: OrderStatus, orderType: OrderType): OrderStatus[] {
  const next = ORDER_STATUS_TRANSITIONS[current];
  return orderType === "DELIVERY" ? next.filter((s) => s !== "READY_FOR_PICKUP") : next;
}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  phone?: string | null;
  email?: string | null;
}
