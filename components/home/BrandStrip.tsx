import type { Brand } from "@/lib/types";

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <section className="py-6">
      <h2 className="font-heading font-semibold text-xl text-km-ink mb-4">Shop by Brand</h2>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide items-center">
        {brands.map((b) => (
          <div
            key={b.brandId}
            className="shrink-0 border border-km-line rounded-xl px-6 py-4 text-sm font-semibold text-km-muted hover:text-km-blue hover:border-km-blue transition-colors"
          >
            {b.name}
          </div>
        ))}
      </div>
    </section>
  );
}
