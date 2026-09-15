"use client";

import { useEffect, useState } from "react";
import { getNextOrderStatuses, type OrderStatus } from "@bite-corner/shared";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatInr } from "@/lib/format";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";

interface Agent {
  id: string;
  name: string;
  deliveryAgentProfile: { isActive: boolean } | null;
}

const STATUS_FILTERS: (OrderStatus | "ALL")[] = ["ALL", "PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function load() {
    const qs = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
    apiFetch<{ orders: Order[] }>(`/api/admin/orders${qs}`).then((d) => setOrders(d.orders));
  }

  useEffect(load, [statusFilter]);
  useEffect(() => {
    apiFetch<{ agents: Agent[] }>("/api/admin/agents").then((d) => setAgents(d.agents));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("admin:subscribe");
    socket.on("order:new", load);
    socket.on("order:status", load);
    socket.on("order:payment-status", load);
    return () => {
      socket.off("order:new", load);
      socket.off("order:status", load);
      socket.off("order:payment-status", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await apiFetch(`/api/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  async function assignAgent(orderId: string, agentId: string) {
    await apiFetch(`/api/admin/orders/${orderId}/assign-agent`, { method: "PATCH", body: JSON.stringify({ deliveryAgentId: agentId }) });
    load();
  }

  async function markPaid(orderId: string) {
    await apiFetch(`/api/orders/${orderId}/mark-paid`, { method: "PATCH" });
    load();
  }

  const activeAgents = agents.filter((a) => a.deliveryAgentProfile?.isActive);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Chip key={s} size="sm" active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s.replace(/_/g, " ")}</Chip>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {orders.map((order) => {
          const expanded = expandedId === order.id;
          const nextStatuses = getNextOrderStatuses(order.status, order.type);
          return (
            <Card key={order.id}>
              <button onClick={() => setExpandedId(expanded ? null : order.id)} className="flex w-full items-center justify-between text-left">
                <div>
                  <span className="font-semibold">#{order.orderNumber}</span>
                  <span className="ml-2 text-sm text-ink/60">{order.customer?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="font-bold text-red-600">{formatInr(order.totalAmount)}</span>
                </div>
              </button>

              {expanded && (
                <div className="mt-3 border-t border-red-100 pt-3">
                  <p className="text-sm text-ink/70">{order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</p>
                  {order.address && <p className="mt-1 text-sm text-ink/60">{order.address.line1}, {order.address.area}, {order.address.city}</p>}
                  {order.specialInstructions && <p className="mt-1 text-xs italic text-ink/50">&quot;{order.specialInstructions}&quot;</p>}
                  {order.customer?.phone && <a href={`tel:${order.customer.phone}`} className="mt-1 block text-sm text-red-600">Call {order.customer.phone}</a>}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {nextStatuses.length > 0 && (
                      <select onChange={(e) => e.target.value && updateStatus(order.id, e.target.value as OrderStatus)} defaultValue="" className="rounded-lg border-2 border-ink/15 px-2 py-1.5 text-sm">
                        <option value="" disabled>Update status...</option>
                        {nextStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    )}
                    {order.type === "DELIVERY" && !["CANCELLED", "REJECTED", "DELIVERED", "COMPLETED"].includes(order.status) && (
                      <select onChange={(e) => e.target.value && assignAgent(order.id, e.target.value)} defaultValue="" className="rounded-lg border-2 border-ink/15 px-2 py-1.5 text-sm">
                        <option value="" disabled>Assign agent...</option>
                        {activeAgents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    )}
                    {order.paymentStatus === "UNPAID" && !["CANCELLED", "REJECTED"].includes(order.status) && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(order.id)}>Mark paid</Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {orders.length === 0 && <p className="text-sm text-ink/50">No orders match this filter.</p>}
      </div>
    </div>
  );
}
