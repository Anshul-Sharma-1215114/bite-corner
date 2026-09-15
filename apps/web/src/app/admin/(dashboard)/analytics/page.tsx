"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";

interface AnalyticsData {
  totalSales: number;
  orderVolume: number;
  averageOrderValue: number;
  completedOrders: number;
  salesByDay: { date: string; total: number }[];
  bestSellers: { name: string; quantity: number }[];
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    apiFetch<AnalyticsData>(`/api/admin/analytics?days=${days}`).then(setData);
  }, [days]);

  const maxSales = data ? Math.max(...data.salesByDay.map((d) => d.total), 1) : 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <div className="mt-4 flex gap-2">
        {[7, 30, 90].map((d) => <Chip key={d} active={days === d} onClick={() => setDays(d)}>{d} days</Chip>)}
      </div>

      {data && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card><p className="text-xs text-ink/50">Total Sales</p><p className="mt-1 text-xl font-bold text-red-600">{formatInr(data.totalSales)}</p></Card>
            <Card><p className="text-xs text-ink/50">Orders</p><p className="mt-1 text-xl font-bold text-red-600">{data.orderVolume}</p></Card>
            <Card><p className="text-xs text-ink/50">Avg Order Value</p><p className="mt-1 text-xl font-bold text-red-600">{formatInr(data.averageOrderValue)}</p></Card>
            <Card><p className="text-xs text-ink/50">Completed</p><p className="mt-1 text-xl font-bold text-red-600">{data.completedOrders}</p></Card>
          </div>

          <Card className="mt-4">
            <h2 className="mb-3 font-semibold">Sales by day</h2>
            <div className="flex items-end gap-1.5" style={{ height: 140 }}>
              {data.salesByDay.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${formatInr(d.total)}`}>
                  <div className="w-full rounded-t bg-red-500" style={{ height: `${Math.max(4, (d.total / maxSales) * 120)}px` }} />
                  <span className="text-[10px] text-ink/40">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-4">
            <h2 className="mb-3 font-semibold">Best sellers</h2>
            <div className="flex flex-col gap-2">
              {data.bestSellers.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-semibold text-red-600">{item.quantity} sold</span>
                </div>
              ))}
              {data.bestSellers.length === 0 && <p className="text-sm text-ink/50">No sales in this period yet.</p>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
