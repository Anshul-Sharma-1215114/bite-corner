"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  isBlocked: boolean;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  function load() {
    apiFetch<{ customers: Customer[] }>("/api/admin/customers").then((d) => setCustomers(d.customers));
  }
  useEffect(load, []);

  async function toggleBlock(id: string, isBlocked: boolean) {
    await apiFetch(`/api/admin/customers/${id}/block`, { method: "PATCH", body: JSON.stringify({ isBlocked }) });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Customers</h1>
      <div className="mt-4 flex flex-col gap-2">
        {customers.map((c) => (
          <Card key={c.id} className="flex items-center justify-between">
            <Link href={`/admin/customers/${c.id}`} className="flex-1">
              <span className="font-semibold hover:text-red-600">{c.name}</span>
              <span className="ml-2 text-sm text-ink/50">{c.phone} · {c._count.orders} orders</span>
            </Link>
            <button onClick={() => toggleBlock(c.id, !c.isBlocked)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {c.isBlocked ? "Blocked" : "Active"}
            </button>
          </Card>
        ))}
        {customers.length === 0 && <p className="text-sm text-ink/50">No customers yet.</p>}
      </div>
    </div>
  );
}
