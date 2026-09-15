"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatInr } from "@/lib/format";
import type { Address, Order } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";

interface CustomerDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  addresses: Address[];
  orders: Order[];
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    apiFetch<{ customer: CustomerDetail }>(`/api/admin/customers/${id}`).then((d) => setCustomer(d.customer));
  }, [id]);

  if (!customer) return <p className="text-sm text-ink/50">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{customer.name}</h1>
      <p className="text-sm text-ink/50">{customer.phone} {customer.email && `· ${customer.email}`}</p>

      <h2 className="mt-6 mb-2 font-semibold">Addresses</h2>
      <div className="flex flex-col gap-2">
        {customer.addresses.map((a) => (
          <Card key={a.id}><p className="text-sm">{a.label} — {a.line1}, {a.area}, {a.city} - {a.pincode}</p></Card>
        ))}
        {customer.addresses.length === 0 && <p className="text-sm text-ink/50">No saved addresses.</p>}
      </div>

      <h2 className="mt-6 mb-2 font-semibold">Order history</h2>
      <div className="flex flex-col gap-2">
        {customer.orders.map((o) => (
          <Card key={o.id} className="flex items-center justify-between">
            <span className="text-sm">#{o.orderNumber}</span>
            <StatusBadge status={o.status} />
            <span className="font-semibold text-red-600">{formatInr(o.totalAmount)}</span>
          </Card>
        ))}
        {customer.orders.length === 0 && <p className="text-sm text-ink/50">No orders yet.</p>}
      </div>
    </div>
  );
}
