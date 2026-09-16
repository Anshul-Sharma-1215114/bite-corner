"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, Plus } from "lucide-react";
import { apiFetch, apiUpload } from "@/lib/api";
import { resolveImageUrl } from "@/lib/api-url";
import { formatInr } from "@/lib/format";
import type { Category, MenuItem, Combo } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export default function AdminMenuPage() {
  const [tab, setTab] = useState<"items" | "combos">("items");
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Menu Management</h1>
      <div className="mt-4 flex gap-2">
        <Chip active={tab === "items"} onClick={() => setTab("items")}>Items</Chip>
        <Chip active={tab === "combos"} onClick={() => setTab("combos")}>Combos</Chip>
      </div>
      <div className="mt-4">{tab === "items" ? <ItemsTab /> : <CombosTab />}</div>
    </div>
  );
}

function ItemsTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "", isVeg: true });
  const [imageFile, setImageFile] = useState<File | null>(null);

  function load() {
    apiFetch<{ categories: Category[] }>("/api/categories").then((d) => setCategories(d.categories));
    apiFetch<{ items: MenuItem[] }>("/api/admin/menu-items").then((d) => setItems(d.items));
  }
  useEffect(load, []);

  async function addCategory() {
    if (!newCategory.trim()) return;
    await apiFetch("/api/admin/categories", { method: "POST", body: JSON.stringify({ name: newCategory.trim() }) });
    setNewCategory("");
    load();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Items inside it will be affected.")) return;
    await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  function startNew() {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", categoryId: categories[0]?.id ?? "", isVeg: true });
    setImageFile(null);
    setShowForm(true);
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description ?? "", price: item.price, categoryId: item.categoryId, isVeg: item.isVeg });
    setImageFile(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("categoryId", form.categoryId);
    fd.append("isVeg", String(form.isVeg));
    if (imageFile) fd.append("image", imageFile);

    if (editingId) await apiUpload(`/api/admin/menu-items/${editingId}`, fd, "PATCH");
    else await apiUpload("/api/admin/menu-items", fd, "POST");
    setShowForm(false);
    load();
  }

  async function toggleAvailability(item: MenuItem) {
    await apiFetch(`/api/admin/menu-items/${item.id}/availability`, { method: "PATCH", body: JSON.stringify({ available: !item.available }) });
    load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await apiFetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <Card className="mb-4">
        <h2 className="mb-2 font-semibold">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm text-red-700">
              {c.name}
              <button onClick={() => deleteCategory(c.id)} className="text-red-400 hover:text-red-700"><Trash2 className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <Button size="sm" onClick={addCategory}><Plus className="h-3.5 w-3.5" /> Add</Button>
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Menu Items</h2>
        {!showForm && <Button size="sm" onClick={startNew}>+ Add item</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="mb-4 flex flex-col gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-soft">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" rows={2} />
          <div className="flex flex-wrap gap-3">
            <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-32 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
            <select required value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm">
              <option value="" disabled>Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm((f) => ({ ...f, isVeg: e.target.checked }))} /> Veg
            </label>
          </div>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="text-sm" />
          <div className="flex gap-2">
            <Button type="submit" size="sm">{editingId ? "Save changes" : "Create item"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const imageUrl = resolveImageUrl(item.imageUrl);
          return (
            <Card key={item.id} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-yellow-50">
                {imageUrl && <Image src={imageUrl} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-sm font-bold text-red-600">{formatInr(item.price)}</span>
                </div>
                <p className="text-xs text-ink/50">{item.category?.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => toggleAvailability(item)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.available ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"}`}>
                    {item.available ? "Available" : "Sold out"}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>Edit</Button>
                  <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" variant="ghost" size="sm" className="text-red-600" onClick={() => deleteItem(item.id)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CombosTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [comboItems, setComboItems] = useState<{ menuItemId: string; quantity: number; swappable: boolean }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  function load() {
    apiFetch<{ items: MenuItem[] }>("/api/admin/menu-items").then((d) => setItems(d.items));
    apiFetch<{ combos: Combo[] }>("/api/admin/combos").then((d) => setCombos(d.combos));
  }
  useEffect(load, []);

  function startNew() {
    setEditingId(null);
    setForm({ name: "", description: "", price: "" });
    setComboItems([]);
    setImageFile(null);
    setShowForm(true);
  }

  function addComboItem() {
    if (items.length === 0) return;
    setComboItems((prev) => [...prev, { menuItemId: items[0].id, quantity: 1, swappable: false }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("items", JSON.stringify(comboItems));
    if (imageFile) fd.append("image", imageFile);

    if (editingId) await apiUpload(`/api/admin/combos/${editingId}`, fd, "PATCH");
    else await apiUpload("/api/admin/combos", fd, "POST");
    setShowForm(false);
    load();
  }

  async function deleteCombo(id: string) {
    if (!confirm("Delete this combo?")) return;
    await apiFetch(`/api/admin/combos/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Combos</h2>
        {!showForm && <Button size="sm" onClick={startNew}>+ Add combo</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-3 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 shadow-soft">
          <input required placeholder="Combo name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="rounded-lg border border-ink/15 px-3 py-2 text-sm" rows={2} />
          <input required type="number" step="0.01" placeholder="Combo price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-32 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="text-sm" />

          <div className="flex flex-col gap-2">
            {comboItems.map((ci, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select value={ci.menuItemId} onChange={(e) => setComboItems((prev) => prev.map((p, i) => (i === idx ? { ...p, menuItemId: e.target.value } : p)))} className="flex-1 rounded-lg border border-ink/15 px-2 py-1.5 text-sm">
                  {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                </select>
                <input type="number" min={1} value={ci.quantity} onChange={(e) => setComboItems((prev) => prev.map((p, i) => (i === idx ? { ...p, quantity: Number(e.target.value) } : p)))} className="w-16 rounded-lg border border-ink/15 px-2 py-1.5 text-sm" />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={ci.swappable} onChange={(e) => setComboItems((prev) => prev.map((p, i) => (i === idx ? { ...p, swappable: e.target.checked } : p)))} /> Swappable
                </label>
                <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} label="Remove" variant="ghost" size="sm" onClick={() => setComboItems((prev) => prev.filter((_, i) => i !== idx))} />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addComboItem}><Plus className="h-3.5 w-3.5" /> Add item to combo</Button>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm">{editingId ? "Save changes" : "Create combo"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {combos.map((combo) => (
          <Card key={combo.id} tone="yellow">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{combo.name}</span>
              <span className="text-sm font-bold text-red-600">{formatInr(combo.price)}</span>
            </div>
            <p className="mt-1 text-xs text-ink/60">{combo.items.map((i) => i.menuItem.name).join(", ")}</p>
            <div className="mt-2">
              <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" variant="ghost" size="sm" className="text-red-600" onClick={() => deleteCombo(combo.id)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
