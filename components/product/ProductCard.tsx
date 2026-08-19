"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { toggle, isWishlisted } = useWishlist();
  const { addItem } = useCart();
  const wishlisted = isWishlisted(product.productId);
  const outOfStock = product.stock <= 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    if (!variant) return;
    addItem({
      productId: product.productId,
      variantId: variant.variantId,
      sku: variant.sku,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      size: variant.size,
      color: variant.color,
      price: variant.price,
      mrp: product.mrp,
      quantity: 1,
      maxStock: variant.stock,
    });
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group block rounded-xl border border-km-line overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 ${
        outOfStock ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-[4/5] bg-km-bg-alt overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
            outOfStock ? "grayscale" : ""
          }`}
        />
        {product.discountPercent >= 20 && !outOfStock && (
          <span className="absolute top-2 left-2 bg-km-orange text-white text-xs font-bold px-2 py-1 rounded-md">
            {product.discountPercent}% OFF
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.productId);
          }}
          aria-label="Toggle wishlist"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? "fill-km-orange text-km-orange" : "text-km-muted"}`}
          />
        </button>
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-km-ink text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 left-2 right-2 bg-km-blue text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 md:flex"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-km-muted truncate">{product.brand}</p>
        <p className="text-sm font-medium text-km-ink line-clamp-2 leading-snug mt-0.5 min-h-[2.5em]">
          {product.name}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <span className="bg-km-success text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            {product.rating} ★
          </span>
          <span className="text-[11px] text-km-muted">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5 tabular-nums">
          <span className="font-semibold text-km-ink">{formatPrice(product.sellingPrice)}</span>
          <span className="text-xs text-km-muted line-through">{formatPrice(product.mrp)}</span>
          <span className="text-xs text-km-success font-medium">{product.discountPercent}% off</span>
        </div>
      </div>
    </Link>
  );
}
