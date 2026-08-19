"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { callAdminAction } from "@/lib/adminApi";
import { Button } from "@/components/ui/Button";

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "siteName", label: "Website Name" },
  { key: "contactNumber", label: "Contact Number" },
  { key: "email", label: "Support Email" },
  { key: "address", label: "Business Address" },
  { key: "freeShippingThreshold", label: "Free Shipping Threshold (₹)", type: "number" },
  { key: "shippingCharge", label: "Shipping Charge (₹)", type: "number" },
  { key: "lowStockThreshold", label: "Low Stock Threshold", type: "number" },
  { key: "metaTitle", label: "SEO Meta Title" },
  { key: "metaDescription", label: "SEO Meta Description" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  categories: "Category Tiles",
  flashSale: "Flash Sale",
  bestSellers: "Best Sellers",
  newArrivals: "New Arrivals",
  promoBanner: "Promotional Banner",
  brandStrip: "Brand Strip",
  reviews: "Customer Reviews",
  newsletter: "Newsletter Signup",
};

type HomepageSection = { id: string; enabled: boolean };

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callAdminAction<Record<string, string>>("adminGetSettings").then((res) => {
      if (res.success && res.data) {
        setValues(res.data);
        try {
          const parsed = JSON.parse(res.data.homepageSections || "[]");
          if (Array.isArray(parsed) && parsed.length) setSections(parsed);
          else setSections(Object.keys(SECTION_LABELS).map((id) => ({ id, enabled: true })));
        } catch {
          setSections(Object.keys(SECTION_LABELS).map((id) => ({ id, enabled: true })));
        }
      }
      setLoading(false);
    });
  }, []);

  function moveSection(index: number, direction: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleSection(index: number) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await callAdminAction("saveSettings", {
      settings: { ...values, homepageSections: JSON.stringify(sections) },
    });
    setSaving(false);
    setMessage(result.success ? "Settings saved. Changes may take a few minutes to reflect on the storefront." : result.message || "Could not save settings.");
  }

  return (
    <div>
      <h1 className="font-heading font-semibold text-2xl mb-4">Website Settings</h1>

      {loading && <p className="text-sm text-km-muted">Loading...</p>}

      {!loading && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white border border-km-line rounded-xl p-4 max-w-lg space-y-4">
            <h2 className="font-heading font-semibold text-sm">General</h2>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-sm font-medium mb-1 block">{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={values[f.key] || ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
                />
              </div>
            ))}
          </div>

          <div className="bg-white border border-km-line rounded-xl p-4 max-w-lg">
            <h2 className="font-heading font-semibold text-sm mb-1">Homepage Sections</h2>
            <p className="text-xs text-km-muted mb-3">Enable/disable and reorder the sections shown on your homepage.</p>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between border border-km-line rounded-lg px-3 py-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={s.enabled} onChange={() => toggleSection(i)} />
                    {SECTION_LABELS[s.id] || s.id}
                  </label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} className="disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} className="disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" loading={saving}>Save Settings</Button>
          {message && <p className="text-sm text-km-muted">{message}</p>}
        </form>
      )}
    </div>
  );
}
