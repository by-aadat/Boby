"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { callAdminAction } from "@/lib/adminApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Banner } from "@/lib/types";

const emptyForm = { title: "", subtitle: "", image: "", buttonText: "Shop Now", buttonUrl: "/products", sortOrder: "1", status: "active" };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const result = await callAdminAction<Banner[]>("adminGetBanners");
    if (result.success) setBanners(result.data || []);
    else setError(result.message || "Could not load banners");
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await callAdminAction("saveBanner", {
      title: form.title, subtitle: form.subtitle, image: form.image,
      buttonText: form.buttonText, buttonUrl: form.buttonUrl,
      sortOrder: Number(form.sortOrder) || 1, status: form.status,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.message || "Could not save banner");
      return;
    }
    setShowForm(false);
    setForm(emptyForm);
    load();
  }

  async function handleDelete(bannerId: string) {
    if (!confirm("Delete this banner?")) return;
    await callAdminAction("deleteBanner", { bannerId });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading font-semibold text-2xl">Banners</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Banner</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-km-line rounded-xl p-4 mb-4 space-y-3 max-w-md">
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Button Text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Button URL" value={form.buttonUrl} onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {error && <p className="text-sm text-km-danger">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Banner</Button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.bannerId} className="bg-white border border-km-line rounded-xl overflow-hidden">
            <img src={b.image} alt={b.title} className="w-full h-32 object-cover" />
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{b.title}</p>
                <Badge tone={b.status === "active" ? "success" : "muted"}>{b.status}</Badge>
              </div>
              <button onClick={() => handleDelete(b.bannerId)} className="text-km-danger"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-sm text-km-muted col-span-2 text-center py-8">No banners yet</p>}
      </div>
    </div>
  );
}
