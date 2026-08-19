"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Zap } from "lucide-react";

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(target - Date.now());
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { h, m, s };
}

export function FlashSale({ products }: { products: Product[] }) {
  const target = useState(() => Date.now() + 1000 * 60 * 60 * 8)[0];
  const { h, m, s } = useCountdown(target);
  if (products.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-6">
      <div className="bg-km-orange-soft rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-km-orange fill-km-orange" />
            <h2 className="font-heading font-bold text-xl text-km-ink">Flash Sale</h2>
          </div>
          <div className="flex items-center gap-1 font-mono text-sm font-bold tabular-nums">
            <span className="bg-km-ink text-white rounded px-2 py-1">{pad(h)}</span>:
            <span className="bg-km-ink text-white rounded px-2 py-1">{pad(m)}</span>:
            <span className="bg-km-ink text-white rounded px-2 py-1">{pad(s)}</span>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
          {products.map((p) => (
            <div key={p.productId} className="w-[46%] sm:w-[220px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
