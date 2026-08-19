"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { callAdminAction } from "@/lib/adminApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";

type Coupon = {
  couponId: string;
  couponCode: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrder: number;
  maximumDiscount: number | null;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  status: string;
};

const emptyForm = {
  couponCode: "", discountType: "percentage" as "percentage" | "fixed", discountValue: "",
  minimumOrder: "", maximumDiscount: "", expiryDate: "", usageLimit: "", status: "active",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const result = await callAdminAction<Coupon[]>("adminGetCoupons");
    if (result.success) setCoupons(result.data || []);
    else setError(result.message || "Could not load coupons");
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await callAdminAction("saveCoupon", {
      couponCode: form.couponCode,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minimumOrder: Number(form.minimumOrder) || 0,
      maximumDiscount: form.maximumDiscount ? Number(form.maximumDiscount) : undefined,
      expiryDate: form.expiryDate,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      status: form.status,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.message || "Could not save coupon");
      return;
    }
    setShowForm(false);
    setForm(emptyForm);
    load();
  }

  async function handleDelete(couponId: string) {
    if (!confirm("Delete this coupon?")) return;
    await callAdminAction("deleteCoupon", { couponId });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading font-semibold text-2xl">Coupons</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Coupon</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-km-line rounded-xl p-4 mb-4 space-y-3 max-w-md">
          <input required placeholder="Coupon Code (e.g. SUMMER20)" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })} className="border border-km-line rounded-lg px-3 py-2 text-sm">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input required type="number" placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 200"} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Min order (₹)" value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Max discount (₹, optional)" value={form.maximumDiscount} onChange={(e) => setForm({ ...form, maximumDiscount: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-km-danger">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Coupon</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-km-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-km-muted border-b border-km-line">
              <th className="py-2 px-4">Code</th>
              <th className="py-2 px-4">Discount</th>
              <th className="py-2 px-4">Min Order</th>
              <th className="py-2 px-4">Used</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.couponId} className="border-b border-km-line last:border-0">
                <td className="py-2 px-4 font-medium">{c.couponCode}</td>
                <td className="py-2 px-4">{c.discountType === "percentage" ? `${c.discountValue}%` : formatPrice(c.discountValue)}</td>
                <td className="py-2 px-4">{formatPrice(c.minimumOrder)}</td>
                <td className="py-2 px-4 tabular-nums">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="py-2 px-4"><Badge tone={c.status === "active" ? "success" : "muted"}>{c.status}</Badge></td>
                <td className="py-2 px-4">
                  <button onClick={() => handleDelete(c.couponId)} className="text-km-danger"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-km-muted">No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
