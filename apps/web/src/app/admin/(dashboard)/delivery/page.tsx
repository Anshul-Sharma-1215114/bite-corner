"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatInr } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  deliveryAgentProfile: { vehicleNumber: string | null; isActive: boolean } | null;
  assignedOrders: { id: string }[];
}

export default function AdminDeliveryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", vehicleNumber: "" });

  function load() {
    apiFetch<{ agents: Agent[] }>("/api/admin/agents").then((d) => setAgents(d.agents));
    apiFetch<{ orders: Order[] }>("/api/admin/orders?status=OUT_FOR_DELIVERY").then((d) => setActiveDeliveries(d.orders));
  }
  useEffect(load, []);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("admin:subscribe");
    socket.on("order:status", load);
    return () => {
      socket.off("order:status", load);
    };
  }, []);

  async function toggleActive(agentId: string, isActive: boolean) {
    await apiFetch(`/api/admin/agents/${agentId}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) });
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch("/api/admin/agents", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", email: "", phone: "", password: "", vehicleNumber: "" });
    setShowForm(false);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Delivery</h1>

      <h2 className="mt-6 mb-3 font-semibold">Active Deliveries</h2>
      <div className="flex flex-col gap-3">
        {activeDeliveries.map((order) => (
          <Card key={order.id}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">#{order.orderNumber}</span>
              <span className="font-bold text-red-600">{formatInr(order.totalAmount)}</span>
            </div>
            <p className="mt-1 text-sm text-ink/60">{order.address ? `${order.address.line1}, ${order.address.area}` : "—"}</p>
            <p className="text-sm text-ink/60">Agent: {order.deliveryAgent?.name ?? "Unassigned"}</p>
          </Card>
        ))}
        {activeDeliveries.length === 0 && <p className="text-sm text-ink/50">No active deliveries right now.</p>}
      </div>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Agents</h2>
        {!showForm && <Button size="sm" onClick={() => setShowForm(true)}>+ Add agent</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-soft">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <input placeholder="Vehicle number (optional)" value={form.vehicleNumber} onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <Button type="submit" size="sm">Create agent</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{agent.name}</span>
              <button
                onClick={() => toggleActive(agent.id, !agent.deliveryAgentProfile?.isActive)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${agent.deliveryAgentProfile?.isActive ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"}`}
              >
                {agent.deliveryAgentProfile?.isActive ? "Active" : "Deactivated"}
              </button>
            </div>
            <p className="text-sm text-ink/60">{agent.email} · {agent.phone}</p>
            {agent.deliveryAgentProfile?.vehicleNumber && <p className="text-xs text-ink/50">Vehicle: {agent.deliveryAgentProfile.vehicleNumber}</p>}
            <p className="mt-1 text-xs text-ink/50">{agent.assignedOrders.length} active order{agent.assignedOrders.length === 1 ? "" : "s"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
