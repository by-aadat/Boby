import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ProductRail({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-xl text-km-ink">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-km-blue flex items-center gap-0.5 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {products.map((p) => (
          <div key={p.productId} className="w-[46%] sm:w-[220px] shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
