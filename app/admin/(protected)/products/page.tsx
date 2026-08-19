"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { callAdminAction } from "@/lib/adminApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";
import type { Product, PaginatedProducts } from "@/lib/types";

type ProductFormState = {
  productId?: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  mrp: string;
  sellingPrice: string;
  material: string;
  status: "active" | "inactive";
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
};

const emptyForm: ProductFormState = {
  name: "", brand: "", category: "Men", subcategory: "", mrp: "", sellingPrice: "",
  material: "", status: "active", isFeatured: false, isBestseller: false, isNewArrival: false,
};

function ProductForm({ initial, onSaved, onCancel }: { initial: ProductFormState; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await callAdminAction("saveProduct", {
      productId: form.productId,
      name: form.name,
      brand: form.brand,
      category: form.category,
      subcategory: form.subcategory,
      mrp: Number(form.mrp) || Number(form.sellingPrice),
      sellingPrice: Number(form.sellingPrice),
      material: form.material,
      status: form.status,
      isFeatured: form.isFeatured,
      isBestseller: form.isBestseller,
      isNewArrival: form.isNewArrival,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.message || "Could not save product");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-km-line rounded-xl p-4 mb-4 space-y-3">
      <h3 className="font-heading font-semibold">{form.productId ? "Edit Product" : "Add Product"}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input required placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm">
          <option>Men</option><option>Women</option><option>Kids</option><option>Accessories</option>
        </select>
        <input placeholder="Subcategory (e.g. Shirts)" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <input required type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="MRP" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isBestseller} onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })} /> Bestseller</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} /> New Arrival</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className="border border-km-line rounded-lg px-2 py-1 text-sm">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {error && <p className="text-sm text-km-danger">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>Save Product</Button>
      </div>
      <p className="text-xs text-km-muted">
        Note: variants (size/colour/stock) are managed directly in the ProductVariants sheet for now — a dedicated variant editor is a good next addition.
      </p>
    </form>
  );
}

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [query, setQuery] = useState("");
  const [formState, setFormState] = useState<ProductFormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const result = await callAdminAction<PaginatedProducts>("adminGetProducts", { query, pageSize: 50 });
    if (!result.success) {
      setError(result.message || "Could not load products");
      return;
    }
    setData(result.data || null);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product? It will be hidden from the storefront.")) return;
    await callAdminAction("deleteProduct", { productId });
    load();
  }

  function editProduct(p: Product) {
    setFormState({
      productId: p.productId, name: p.name, brand: p.brand, category: p.category,
      subcategory: p.subcategory, mrp: String(p.mrp), sellingPrice: String(p.sellingPrice),
      material: p.material, status: p.status === "deleted" ? "inactive" : p.status,
      isFeatured: p.isFeatured, isBestseller: p.isBestseller, isNewArrival: p.isNewArrival,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="font-heading font-semibold text-2xl">Products</h1>
        {!formState && (
          <Button onClick={() => setFormState(emptyForm)}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      {formState && (
        <ProductForm
          initial={formState}
          onSaved={() => { setFormState(null); load(); }}
          onCancel={() => setFormState(null)}
        />
      )}

      <div className="relative max-w-sm mb-4">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-km-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, SKU, or ID"
          className="w-full border border-km-line rounded-lg pl-9 pr-3 py-2 text-sm bg-white"
        />
      </div>

      {error && <p className="text-sm text-km-danger bg-red-50 border border-red-100 rounded-lg p-3 mb-4">{error}</p>}

      <div className="bg-white border border-km-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-km-muted border-b border-km-line">
              <th className="py-2 px-4">Product</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Stock</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.productId} className="border-b border-km-line last:border-0">
                <td className="py-2 px-4">
                  <p className="font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs text-km-muted">{p.sku}</p>
                </td>
                <td className="py-2 px-4">{p.category} / {p.subcategory}</td>
                <td className="py-2 px-4 tabular-nums">{formatPrice(p.sellingPrice)}</td>
                <td className="py-2 px-4 tabular-nums">{p.stock}</td>
                <td className="py-2 px-4">
                  <Badge tone={p.status === "active" ? "success" : p.status === "deleted" ? "danger" : "muted"}>{p.status}</Badge>
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => editProduct(p)} className="text-km-blue"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.productId)} className="text-km-danger"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-km-muted">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
