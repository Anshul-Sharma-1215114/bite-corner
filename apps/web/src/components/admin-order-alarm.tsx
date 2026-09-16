"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useOrderAlarm } from "@/lib/use-order-alarm";
import type { Order } from "@/lib/types";

// Keeps ringing for as long as any order is sitting unacknowledged in
// PLACED — i.e. from the moment a customer places it until an admin
// accepts (moves it to CONFIRMED) or rejects it. Mounted once at the
// dashboard layout level so it rings no matter which admin page is open.
export function AdminOrderAlarm() {
  const router = useRouter();
  const [pending, setPending] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    apiFetch<{ orders: Order[] }>("/api/admin/orders?status=PLACED")
      .then((d) => setPending(new Map(d.orders.map((o) => [o.id, o.orderNumber]))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("admin:subscribe");

    function onNewOrder(payload: { orderId: string; orderNumber: string }) {
      setPending((prev) => new Map(prev).set(payload.orderId, payload.orderNumber));
    }
    function onStatusChange(payload: { orderId: string; status: string }) {
      if (payload.status === "PLACED") return;
      setPending((prev) => {
        if (!prev.has(payload.orderId)) return prev;
        const next = new Map(prev);
        next.delete(payload.orderId);
        return next;
      });
    }

    socket.on("order:new", onNewOrder);
    socket.on("order:status", onStatusChange);
    return () => {
      socket.off("order:new", onNewOrder);
      socket.off("order:status", onStatusChange);
    };
  }, []);

  useOrderAlarm(pending.size > 0);

  if (pending.size === 0) return null;

  const orderNumbers = Array.from(pending.values());
  return (
    <button
      onClick={() => router.push("/admin/orders?status=PLACED")}
      className="sticky top-0 z-30 flex w-full animate-pulse items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm font-bold text-white"
    >
      <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
      {pending.size === 1
        ? `New order #${orderNumbers[0]} needs a response`
        : `${pending.size} new orders need a response`}
      <span className="underline underline-offset-2">Review now</span>
    </button>
  );
}
