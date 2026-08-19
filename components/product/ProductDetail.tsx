"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Heart, Truck, RotateCcw, ShieldCheck, Star, BadgeCheck } from "lucide-react";
import type { Product, Review } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/format";
import { productRepo } from "@/repositories/productRepo";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductRail } from "./ProductRail";
import { PDPSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageX } from "lucide-react";

const TABS = ["Description", "Specifications", "Size Guide", "Delivery & Returns", "Reviews"] as const;

export function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<null | { available: boolean; date: string }>(null);

  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    productRepo.getProduct(slug).then(({ product, related }) => {
      setProduct(product);
      setRelated(related);
      if (product) {
        setSelectedColor(product.variants[0]?.color ?? null);
        setSelectedSize(product.variants[0]?.size ?? null);
        productRepo.getReviewsForProduct(product.productId).then(setReviews);
      }
    });
  }, [slug]);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null
    );
  }, [product, selectedColor, selectedSize]);

  const colors = useMemo(() => {
    if (!product) return [];
    return [...new Map(product.variants.map((v) => [v.color, v])).values()];
  }, [product]);

  const sizesForColor = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product, selectedColor]);

  function checkPincode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeResult(null);
      return;
    }
    const days = 3 + (parseInt(pincode[0]) % 4);
    const date = new Date(Date.now() + days * 86400000);
    setPincodeResult({ available: true, date: formatDate(date.toISOString()) });
  }

  function handleAddToCart() {
    if (!product || !currentVariant) return;
    addItem({
      productId: product.productId,
      variantId: currentVariant.variantId,
      sku: currentVariant.sku,
      name: product.name,
      slug: product.slug,
      image: currentVariant.image || product.images[0],
      size: currentVariant.size,
      color: currentVariant.color,
      price: currentVariant.price,
      mrp: product.mrp,
      quantity: qty,
      maxStock: currentVariant.stock,
    });
  }

  if (product === undefined) return <div className="py-8"><PDPSkeleton /></div>;

  if (product === null) {
    return (
      <div className="py-8">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          message="This product may have been removed or the link is incorrect."
          actionLabel="Continue Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  const outOfStock = !currentVariant || currentVariant.stock <= 0;
  const lowStock = currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 5;
  const wishlisted = isWishlisted(product.productId);
  const avgRating = product.rating;

  return (
    <div className="py-6">
      <nav className="text-xs text-km-muted mb-4">
        Home / {product.category} / {product.subcategory} / <span className="text-km-ink">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-km-bg-alt">
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 ${
                  activeImage === i ? "border-km-orange" : "border-km-line"
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-km-muted">{product.brand}</p>
          <h1 className="font-heading font-semibold text-2xl text-km-ink mt-1">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge tone="success">{avgRating} ★</Badge>
            <span className="text-sm text-km-muted">{product.reviewCount} reviews</span>
          </div>

          <div className="flex items-baseline gap-2 mt-4 tabular-nums">
            <span className="text-2xl font-bold text-km-ink">{formatPrice(currentVariant?.price ?? product.sellingPrice)}</span>
            <span className="text-base text-km-muted line-through">{formatPrice(product.mrp)}</span>
            <span className="text-sm text-km-success font-semibold">{product.discountPercent}% off</span>
          </div>
          <p className="text-xs text-km-muted mt-0.5">inclusive of all taxes</p>

          <div className="bg-km-orange-soft rounded-xl p-3 mt-4 text-sm space-y-1">
            <p>• Extra 5% off on prepaid orders</p>
            <p>• Bank offer: 10% instant discount on select cards</p>
          </div>

          {colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium mb-2">Colour: <span className="text-km-muted">{selectedColor}</span></p>
              <div className="flex gap-2">
                {colors.map((v) => (
                  <button
                    key={v.color}
                    onClick={() => {
                      setSelectedColor(v.color);
                      const firstAvailable = product.variants.find((x) => x.color === v.color);
                      if (firstAvailable) setSelectedSize(firstAvailable.size);
                    }}
                    className={`h-9 w-9 rounded-full border-2 ${selectedColor === v.color ? "border-km-blue" : "border-km-line"}`}
                    style={{ backgroundColor: v.colorHex }}
                    aria-label={v.color}
                  />
                ))}
              </div>
            </div>
          )}

          {sizesForColor.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Size</p>
                <button className="text-xs text-km-blue underline" onClick={() => setTab("Size Guide")}>Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((v) => (
                  <button
                    key={v.size}
                    disabled={v.stock <= 0}
                    onClick={() => setSelectedSize(v.size)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                      v.stock <= 0
                        ? "border-km-line text-km-muted line-through cursor-not-allowed"
                        : selectedSize === v.size
                        ? "bg-km-blue text-white border-km-blue"
                        : "border-km-line hover:border-km-blue"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            {outOfStock && <Badge tone="danger">Out of Stock</Badge>}
            {lowStock && <Badge tone="warn">Only {currentVariant?.stock} left!</Badge>}
            {!outOfStock && !lowStock && <Badge tone="success">In Stock</Badge>}
          </div>

          {!outOfStock && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center border border-km-line rounded-lg">
                <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="px-3 text-sm tabular-nums">{qty}</span>
                <button
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.min(currentVariant?.stock ?? 1, q + 1))}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="lg" className="flex-1" disabled={outOfStock} onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="primary" size="lg" className="flex-1" disabled={outOfStock} onClick={handleAddToCart}>
              Buy Now
            </Button>
            <button
              onClick={() => toggle(product.productId)}
              className="h-12 w-12 shrink-0 rounded-xl border border-km-line flex items-center justify-center"
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-km-orange text-km-orange" : "text-km-muted"}`} />
            </button>
          </div>

          <form onSubmit={checkPincode} className="mt-6">
            <p className="text-sm font-medium mb-2">Check delivery availability</p>
            <div className="flex gap-2 max-w-xs">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter PIN code"
                className="flex-1 border border-km-line rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
              />
              <Button type="submit" variant="secondary" size="sm">Check</Button>
            </div>
            {pincodeResult && (
              <p className="text-sm text-km-success mt-2">
                Delivery available. Expected by {pincodeResult.date}. Cash on Delivery available.
              </p>
            )}
          </form>

          <div className="grid grid-cols-3 gap-2 mt-6 text-center">
            <div className="flex flex-col items-center gap-1 text-xs text-km-muted">
              <RotateCcw className="h-5 w-5 text-km-blue" /> Easy Returns
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-km-muted">
              <Truck className="h-5 w-5 text-km-blue" /> Cash on Delivery
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-km-muted">
              <ShieldCheck className="h-5 w-5 text-km-blue" /> Genuine Product
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex gap-6 border-b border-km-line overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                tab === t ? "border-km-orange text-km-ink" : "border-transparent text-km-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-km-ink">
          {tab === "Description" && <p className="leading-relaxed">{product.description}</p>}

          {tab === "Specifications" && (
            <table className="w-full text-sm">
              <tbody>
                {product.specifications.map((s) => (
                  <tr key={s.label} className="border-b border-km-line">
                    <td className="py-2 text-km-muted w-1/3">{s.label}</td>
                    <td className="py-2">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "Size Guide" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-km-line rounded-lg overflow-hidden">
                <thead className="bg-km-bg-alt">
                  <tr>
                    <th className="p-2 text-left">Size</th>
                    <th className="p-2 text-left">Chest (in)</th>
                    <th className="p-2 text-left">Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {["S", "M", "L", "XL", "XXL"].map((s, i) => (
                    <tr key={s} className="border-t border-km-line">
                      <td className="p-2 font-medium">{s}</td>
                      <td className="p-2">{36 + i * 2}</td>
                      <td className="p-2">{27 + i}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "Delivery & Returns" && (
            <div className="space-y-2">
              <p>Standard delivery in 3–7 business days depending on your location.</p>
              <p>7-day easy return window from date of delivery. Product must be unused with original tags.</p>
              <p>Cash on Delivery available on orders below ₹5,000.</p>
            </div>
          )}

          {tab === "Reviews" && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{avgRating}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-km-orange text-km-orange" : "text-km-line"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-km-muted mt-1">{product.reviewCount} ratings</p>
                </div>
              </div>
              {reviews.length === 0 ? (
                <p className="text-km-muted">No reviews yet for this product.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.reviewId} className="border-b border-km-line pb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-km-orange text-km-orange" : "text-km-line"}`} />
                          ))}
                        </div>
                        {r.verifiedPurchase && (
                          <span className="flex items-center gap-1 text-xs text-km-success font-medium">
                            <BadgeCheck className="h-3.5 w-3.5" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="mt-1">{r.review}</p>
                      <p className="text-xs text-km-muted mt-1">{r.customerName} · {formatDate(r.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ProductRail title="Related Products" products={related} />
    </div>
  );
}
