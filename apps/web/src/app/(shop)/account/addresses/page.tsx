"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Address } from "@/lib/types";
import { RoleGuard } from "@/components/role-guard";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";

const emptyForm = { label: "HOME" as Address["label"], line1: "", landmark: "", area: "", city: "", pincode: "" };

export default function AddressesPage() {
  return (
    <RoleGuard role="CUSTOMER" loginPath="/login">
      <AddressesContent />
    </RoleGuard>
  );
}

function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    apiFetch<{ addresses: Address[] }>("/api/addresses").then((d) => setAddresses(d.addresses));
  }

  useEffect(load, []);

  function startEdit(address: Address) {
    setEditingId(address.id);
    setForm({ label: address.label, line1: address.line1, landmark: address.landmark ?? "", area: address.area, city: address.city, pincode: address.pincode });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingId) await apiFetch(`/api/addresses/${editingId}`, { method: "PATCH", body: JSON.stringify(form) });
      else await apiFetch("/api/addresses", { method: "POST", body: JSON.stringify(form) });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
    load();
  }

  async function handleSetDefault(id: string) {
    await apiFetch(`/api/addresses/${id}`, { method: "PATCH", body: JSON.stringify({ isDefault: true }) });
    load();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Saved addresses</h1>
        {!showForm && <Button size="sm" onClick={startNew}>+ Add address</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-soft">
          <div className="flex gap-2">
            {(["HOME", "WORK", "OTHER"] as const).map((l) => (
              <Chip type="button" key={l} size="sm" active={form.label === l} onClick={() => setForm((f) => ({ ...f, label: l }))}>{l}</Chip>
            ))}
          </div>
          <input required placeholder="House / flat no., building" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <input placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <div className="flex flex-wrap gap-3">
            <input required placeholder="Area" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
            <input required placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
            <input required placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} className="w-28 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>{saving ? "Saving..." : "Save address"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {addresses.map((address) => (
          <Card key={address.id} className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{address.label}</span>
                {address.isDefault && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Default</span>}
              </div>
              <p className="mt-1 text-sm">{address.line1}, {address.area}, {address.city} - {address.pincode}</p>
              {address.landmark && <p className="text-xs text-ink/50">Near {address.landmark}</p>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <IconButton icon={<Pencil className="h-3.5 w-3.5" />} label="Edit address" variant="ghost" size="sm" onClick={() => startEdit(address)} />
              {!address.isDefault && <IconButton icon={<Star className="h-3.5 w-3.5" />} label="Set as default" variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)} />}
              <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete address" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(address.id)} />
            </div>
          </Card>
        ))}
        {addresses.length === 0 && !showForm && (
          <EmptyState icon={<MapPin className="h-7 w-7" />} title="No saved addresses yet" description="Add one to speed up delivery checkout." action={{ label: "Add address", onClick: startNew }} />
        )}
      </div>
    </main>
  );
}
