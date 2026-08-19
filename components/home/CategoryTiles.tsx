import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section className="py-6">
      <h2 className="font-heading font-semibold text-xl text-km-ink mb-4">Shop by Category</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {categories.map((c) => (
          <Link
            key={c.categoryId}
            href={`/category/${c.slug}`}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border border-km-line group-hover:border-km-orange transition-colors">
              <Image src={c.image} alt={c.name} fill sizes="96px" className="object-cover" />
            </div>
            <span className="text-sm font-medium text-km-ink">{c.name}</span>
            <span className="text-xs text-km-muted -mt-1.5">{c.productCount} items</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
