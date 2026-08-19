"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  selected: {
    brand: string[];
    size: string[];
    color: string[];
    material: string[];
    priceMax: number | null;
    rating: number | null;
  };
  onChange: (next: Props["selected"]) => void;
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-km-line py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-km-ink"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

export function FilterSidebar({ products, selected, onChange }: Props) {
  const brands = [...new Set(products.map((p) => p.brand))];
  const sizes = [...new Set(products.flatMap((p) => p.variants.map((v) => v.size)))];
  const colors = [...new Set(products.flatMap((p) => p.variants.map((v) => v.color)))];
  const materials = [...new Set(products.map((p) => p.material))];

  function toggle(key: "brand" | "size" | "color" | "material", value: string) {
    const current = selected[key];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...selected, [key]: next });
  }

  return (
    <div className="text-sm">
      <Section title="Brand">
        {brands.map((b) => (
          <label key={b} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.brand.includes(b)} onChange={() => toggle("brand", b)} />
            {b}
          </label>
        ))}
      </Section>

      <Section title="Price">
        {[500, 1000, 1500, 2000, 3000].map((max) => (
          <label key={max} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="priceMax"
              checked={selected.priceMax === max}
              onChange={() => onChange({ ...selected, priceMax: max })}
            />
            Under ₹{max}
          </label>
        ))}
        {selected.priceMax != null && (
          <button className="text-xs text-km-blue underline" onClick={() => onChange({ ...selected, priceMax: null })}>
            Clear price filter
          </button>
        )}
      </Section>

      <Section title="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => toggle("size", s)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                selected.size.includes(s) ? "bg-km-blue text-white border-km-blue" : "border-km-line"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colour">
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => toggle("color", c)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                selected.color.includes(c) ? "bg-km-blue text-white border-km-blue" : "border-km-line"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Material">
        {materials.map((m) => (
          <label key={m} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.material.includes(m)} onChange={() => toggle("material", m)} />
            {m}
          </label>
        ))}
      </Section>

      <Section title="Rating">
        {[4, 3].map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={selected.rating === r}
              onChange={() => onChange({ ...selected, rating: r })}
            />
            {r}★ & above
          </label>
        ))}
        {selected.rating != null && (
          <button className="text-xs text-km-blue underline" onClick={() => onChange({ ...selected, rating: null })}>
            Clear rating filter
          </button>
        )}
      </Section>
    </div>
  );
}
