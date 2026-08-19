import type { Review, Product } from "@/lib/types";
import { Star, BadgeCheck } from "lucide-react";

export function ReviewsSection({ reviews, products }: { reviews: Review[]; products: Product[] }) {
  if (reviews.length === 0) return null;
  const sample = reviews.slice(0, 3);
  return (
    <section className="py-6">
      <h2 className="font-heading font-semibold text-xl text-km-ink mb-4">What Our Customers Say</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {sample.map((r) => {
          const product = products.find((p) => p.productId === r.productId);
          return (
            <div key={r.reviewId} className="border border-km-line rounded-xl p-4">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-km-orange text-km-orange" : "text-km-line"}`} />
                ))}
              </div>
              <p className="text-sm text-km-ink">{r.review}</p>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-sm font-medium">{r.customerName}</p>
                  {product && <p className="text-xs text-km-muted">{product.name}</p>}
                </div>
                {r.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs text-km-success font-medium">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
