"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatInr } from "@/lib/format";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Analytics {
  totalSales: number;
  orderVolume: number;
  averageOrderValue: number;
  completedOrders: number;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  function load() {
    apiFetch<{ orders: Order[] }>("/api/admin/orders").then((d) => setOrders(d.orders.slice(0, 20)));
    apiFetch<Analytics>("/api/admin/analytics?days=1").then(setAnalytics);
  }

  useEffect(load, []);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("admin:subscribe");
    function onNewOrder(payload: { orderId: string }) {
      load();
      setFlashIds((prev) => new Set(prev).add(payload.orderId));
      setTimeout(() => setFlashIds((prev) => { const next = new Set(prev); next.delete(payload.orderId); return next; }), 4000);
    }
    function onStatus() {
      load();
    }
    socket.on("order:new", onNewOrder);
    socket.on("order:status", onStatus);
    return () => {
      socket.off("order:new", onNewOrder);
      socket.off("order:status", onStatus);
    };
  }, []);

  async function quickUpdate(orderId: string, status: "CONFIRMED" | "REJECTED") {
    await apiFetch(`/api/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><p className="text-xs text-ink/50">Today&apos;s Sales</p><p className="mt-1 text-xl font-bold text-red-600">{formatInr(analytics?.totalSales ?? 0)}</p></Card>
        <Card><p className="text-xs text-ink/50">Orders Today</p><p className="mt-1 text-xl font-bold text-red-600">{analytics?.orderVolume ?? 0}</p></Card>
        <Card><p className="text-xs text-ink/50">Avg Order Value</p><p className="mt-1 text-xl font-bold text-red-600">{formatInr(analytics?.averageOrderValue ?? 0)}</p></Card>
        <Card><p className="text-xs text-ink/50">Completed</p><p className="mt-1 text-xl font-bold text-red-600">{analytics?.completedOrders ?? 0}</p></Card>
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-bold">Latest Orders</h2>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Card key={order.id} className={flashIds.has(order.id) ? "ring-4 ring-yellow-400" : ""}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">#{order.orderNumber}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-ink/60">{order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-ink/70">
              <span>{order.customer?.name}</span>
              {order.customer?.phone && (
                <a href={`tel:${order.customer.phone}`} className="flex items-center gap-1 text-red-600"><Phone className="h-3 w-3" /> {order.customer.phone}</a>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold text-red-600">{formatInr(order.totalAmount)}</span>
              {order.status === "PLACED" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => quickUpdate(order.id, "CONFIRMED")}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => quickUpdate(order.id, "REJECTED")}>Reject</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-sm text-ink/50">No orders yet.</p>}
      </div>
    </div>
  );
}
