"use client";

import { useEffect, useState } from "react";
import { Phone, LogOut, Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatInr } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useOrderAlarm } from "@/lib/use-order-alarm";
import { RoleGuard } from "@/components/role-guard";
import { StatusBadge } from "@/components/status-badge";
import { OrderStatusStepper } from "@/components/order-status-stepper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

const ACTIVE_STATUSES = ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"];

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function DeliveryPage() {
  return (
    <RoleGuard role="DELIVERY_AGENT" loginPath="/delivery/login">
      <DeliveryContent />
    </RoleGuard>
  );
}

function DeliveryContent() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function load() {
    apiFetch<{ orders: Order[] }>("/api/delivery/orders").then((d) => setOrders(d.orders));
  }
  useEffect(load, []);

  // Assigned but not yet accepted — this is what rings the alarm below.
  const pending = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status) && !o.deliveryAcceptedAt) ?? [];
  const active = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status) && o.deliveryAcceptedAt) ?? [];
  const history = orders?.filter((o) => !ACTIVE_STATUSES.includes(o.status)) ?? [];

  useOrderAlarm(pending.length > 0);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("agent:subscribe-self");
    for (const o of active) socket.emit("order:subscribe", o.id);
    socket.on("order:agent-assigned", load);
    socket.on("order:status", load);
    socket.on("order:payment-status", load);
    return () => {
      socket.off("order:agent-assigned", load);
      socket.off("order:status", load);
      socket.off("order:payment-status", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders?.length]);

  async function markStatus(orderId: string, status: "OUT_FOR_DELIVERY" | "DELIVERED") {
    await apiFetch(`/api/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  async function markPaid(orderId: string) {
    await apiFetch(`/api/orders/${orderId}/mark-paid`, { method: "PATCH" });
    load();
  }

  async function respondToAssignment(orderId: string, action: "accept" | "reject") {
    await apiFetch(`/api/delivery/orders/${orderId}/${action}`, { method: "POST" });
    load();
  }

  return (
    <div className="min-h-screen bg-paper-100">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-4 border-yellow-400 bg-white px-4 py-3 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-display font-bold text-white">{user ? initials(user.name) : ""}</span>
          <div>
            <p className="font-display font-bold">{user?.name}</p>
            <p className="text-xs text-ink/50">Delivery Agent</p>
          </div>
        </div>
        <IconButton icon={<LogOut className="h-4 w-4" />} label="Log out" variant="ghost" onClick={logout} />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 flex items-center gap-1.5 font-display text-lg font-bold text-red-600">
              <Bell className="h-4 w-4 animate-pulse" aria-hidden="true" /> New Delivery Request
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map((order) => (
                <Card key={order.id} className="border-2 border-red-400 shadow-lifted">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink/70">{order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</p>
                  {order.address && <p className="mt-1 text-sm text-ink/60">{order.address.line1}, {order.address.area}, {order.address.city}</p>}
                  <p className="mt-2 font-bold text-red-600">{formatInr(order.totalAmount)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => respondToAssignment(order.id, "accept")}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => respondToAssignment(order.id, "reject")}>Reject</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-3 font-display text-lg font-bold">Active Deliveries</h2>
        <div className="flex flex-col gap-3">
          {active.map((order) => (
            <Card key={order.id} className="border-red-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold">#{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-ink/70">{order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</p>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span>{order.customer?.name}</span>
                {order.customer?.phone && (
                  <a href={`tel:${order.customer.phone}`} className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white"><Phone className="h-3 w-3" /> Call</a>
                )}
              </div>
              {order.address && <p className="mt-1 text-sm text-ink/60">{order.address.line1}, {order.address.area}, {order.address.city}</p>}
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-red-600">{formatInr(order.totalAmount)}</span>
                {order.paymentStatus === "UNPAID" ? (
                  <span className="text-xs font-semibold text-red-600">{order.paymentMethod === "COD" ? "Collect cash" : "Confirm UPI"}</span>
                ) : (
                  <span className="text-xs font-semibold text-green-600">Paid</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.status !== "OUT_FOR_DELIVERY" ? (
                  <Button size="sm" onClick={() => markStatus(order.id, "OUT_FOR_DELIVERY")}>Mark picked up</Button>
                ) : (
                  <Button size="sm" onClick={() => markStatus(order.id, "DELIVERED")}>Mark delivered</Button>
                )}
                {order.paymentStatus === "UNPAID" && <Button size="sm" variant="outline" onClick={() => markPaid(order.id)}>Mark as paid</Button>}
              </div>
            </Card>
          ))}
          {active.length === 0 && <p className="text-sm text-ink/50">No active deliveries right now.</p>}
        </div>

        <h2 className="mt-8 mb-3 font-display text-lg font-bold">History</h2>
        <div className="flex flex-col gap-2">
          {history.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <Card key={order.id} padded={false}>
                <button onClick={() => setExpandedId(expanded ? null : order.id)} className="flex w-full items-center justify-between p-4 text-left">
                  <span className="font-semibold">#{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                </button>
                {expanded && (
                  <div className="border-t border-red-100 p-4">
                    <OrderStatusStepper type={order.type} status={order.status} />
                    <p className="mt-3 text-sm text-ink/70">{order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</p>
                    <p className="mt-1 text-sm">{order.customer?.name} {order.customer?.phone && `· ${order.customer.phone}`}</p>
                    <p className="mt-1 text-sm text-ink/60">{order.address ? `${order.address.line1}, ${order.address.area}, ${order.address.city}` : order.type}</p>
                    <p className="mt-2 font-semibold text-red-600">{formatInr(order.totalAmount)}</p>
                  </div>
                )}
              </Card>
            );
          })}
          {history.length === 0 && <p className="text-sm text-ink/50">No delivery history yet.</p>}
        </div>
      </main>
    </div>
  );
}
