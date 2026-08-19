"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product, ProductFilters } from "@/lib/types";
import { productRepo } from "@/repositories/productRepo";
import { ProductGrid } from "./ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { Button } from "@/components/ui/Button";

type Props = {
  category?: string;
  query?: string;
  title: string;
};

const emptySelected = {
  brand: [] as string[],
  size: [] as string[],
  color: [] as string[],
  material: [] as string[],
  priceMax: null as number | null,
  rating: null as number | null,
};

export function ProductListing({ category, query, title }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allCategoryProducts, setAllCategoryProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [sort, setSort] = useState<NonNullable<ProductFilters["sort"]>>(
    (searchParams.get("sort") as ProductFilters["sort"]) || "relevance"
  );
  const [selected, setSelected] = useState(emptySelected);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // fetch the unfiltered category set once, to build filter options from
  useEffect(() => {
    productRepo.getProducts({ category, pageSize: 500 }).then((res) => setAllCategoryProducts(res.items));
  }, [category]);

  useEffect(() => {
    setLoading(true);
    const filters: ProductFilters = {
      category,
      query,
      page,
      pageSize: 20,
      sort,
      brand: selected.brand.length ? selected.brand : undefined,
      size: selected.size.length ? selected.size : undefined,
      color: selected.color.length ? selected.color : undefined,
      material: selected.material.length ? selected.material : undefined,
      priceMax: selected.priceMax ?? undefined,
      rating: selected.rating ?? undefined,
    };
    productRepo.getProducts(filters).then((res) => {
      setItems(res.items);
      setTotal(res.total);
      setLoading(false);
    });

    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (sort !== "relevance") params.set("sort", sort);
    if (selected.brand.length) params.set("brand", selected.brand.join(","));
    if (selected.size.length) params.set("size", selected.size.join(","));
    if (selected.color.length) params.set("color", selected.color.join(","));
    if (selected.material.length) params.set("material", selected.material.join(","));
    if (selected.priceMax != null) params.set("priceMax", String(selected.priceMax));
    if (selected.rating != null) params.set("rating", String(selected.rating));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, page, sort, selected]);

  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    selected.brand.forEach((b) => chips.push({ label: b, clear: () => setSelected((s) => ({ ...s, brand: s.brand.filter((x) => x !== b) })) }));
    selected.size.forEach((s2) => chips.push({ label: `Size ${s2}`, clear: () => setSelected((s) => ({ ...s, size: s.size.filter((x) => x !== s2) })) }));
    selected.color.forEach((c) => chips.push({ label: c, clear: () => setSelected((s) => ({ ...s, color: s.color.filter((x) => x !== c) })) }));
    selected.material.forEach((m) => chips.push({ label: m, clear: () => setSelected((s) => ({ ...s, material: s.material.filter((x) => x !== m) })) }));
    if (selected.priceMax != null) chips.push({ label: `Under ₹${selected.priceMax}`, clear: () => setSelected((s) => ({ ...s, priceMax: null })) });
    if (selected.rating != null) chips.push({ label: `${selected.rating}★+`, clear: () => setSelected((s) => ({ ...s, rating: null })) });
    return chips;
  }, [selected]);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-km-ink">{title}</h1>
          {!loading && <p className="text-sm text-km-muted mt-0.5">{total} products found</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 border border-km-line rounded-lg px-3 py-2 text-sm font-medium"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
          <SortDropdown value={sort} onChange={(v) => { setSort(v as NonNullable<ProductFilters["sort"]>); setPage(1); }} />
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.clear}
              className="flex items-center gap-1 bg-km-bg-alt text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {chip.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={() => setSelected(emptySelected)}
            className="text-xs text-km-blue underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-100px)] overflow-y-auto">
          <FilterSidebar products={allCategoryProducts} selected={selected} onChange={(s) => { setSelected(s); setPage(1); }} />
        </aside>

        <div>
          {loading ? <ProductGridSkeleton count={12} /> : <ProductGrid products={items} />}

          {!loading && total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-km-muted">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2 sticky top-0 bg-white pb-2">
              <h3 className="font-heading font-semibold">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar products={allCategoryProducts} selected={selected} onChange={(s) => { setSelected(s); setPage(1); }} />
            <div className="flex gap-2 mt-4 sticky bottom-0 bg-white pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(emptySelected)}>Clear All</Button>
              <Button className="flex-1" onClick={() => setMobileFiltersOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
