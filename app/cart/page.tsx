"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Heart, Tag, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { orderRepo } from "@/repositories/productRepo";
import { formatPrice } from "@/lib/format";
import settings from "@/mock/settings.json";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalMrp, savings } = useCart();
  const { toggle } = useWishlist();
  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error" | "checking">("idle");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const shipping = subtotal >= settings.freeShippingThreshold || items.length === 0 ? 0 : settings.shippingCharge;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal - couponDiscount + shipping + tax;

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponStatus("checking");
    setCouponMessage(null);
    const result = await orderRepo.validateCoupon(code, subtotal);
    if (!result.valid) {
      setCouponStatus("error");
      setCouponDiscount(0);
      setCouponMessage(result.message || "Invalid or expired coupon code.");
      return;
    }
    setCouponDiscount(result.discount);
    setCouponStatus("success");
  }

  if (items.length === 0) {
    return (
      <Container>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet. Start exploring our collections."
          actionLabel="Continue Shopping"
          actionHref="/products"
        />
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <h1 className="font-heading font-semibold text-2xl mb-6">Shopping Cart ({items.length})</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 border border-km-line rounded-xl p-3">
              <div className="relative h-24 w-20 shrink-0 rounded-lg overflow-hidden bg-km-bg-alt">
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="text-sm font-medium hover:text-km-blue line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-xs text-km-muted mt-1">SKU: {item.sku}</p>
                <p className="text-xs text-km-muted">Size: {item.size} · Colour: {item.color}</p>

                <div className="flex items-baseline gap-2 mt-2 tabular-nums">
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                  <span className="text-xs text-km-muted line-through">{formatPrice(item.mrp)}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-km-line rounded-lg">
                    <button className="px-2.5 py-1" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>−</button>
                    <span className="px-2.5 text-sm tabular-nums">{item.quantity}</span>
                    <button className="px-2.5 py-1" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { toggle(item.productId); removeItem(item.variantId); }}
                      aria-label="Move to wishlist"
                      className="text-km-muted hover:text-km-orange"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeItem(item.variantId)} aria-label="Remove item" className="text-km-muted hover:text-km-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-km-line rounded-xl p-4 h-fit lg:sticky lg:top-24">
          <h2 className="font-heading font-semibold mb-3">Order Summary</h2>

          <form onSubmit={applyCoupon} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Tag className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-km-muted" />
              <input
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value); setCouponStatus("idle"); }}
                placeholder="Apply coupon"
                className="w-full border border-km-line rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" loading={couponStatus === "checking"}>Apply</Button>
          </form>
          {couponStatus === "success" && (
            <p className="text-xs text-km-success mb-3">Coupon applied — you saved {formatPrice(couponDiscount)}!</p>
          )}
          {couponStatus === "error" && (
            <p className="text-xs text-km-danger mb-3">{couponMessage}</p>
          )}

          <div className="space-y-2 text-sm tabular-nums">
            <div className="flex justify-between"><span className="text-km-muted">Subtotal (MRP)</span><span>{formatPrice(totalMrp)}</span></div>
            <div className="flex justify-between"><span className="text-km-muted">Product Discount</span><span className="text-km-success">−{formatPrice(savings)}</span></div>
            {couponDiscount > 0 && (
              <div className="flex justify-between"><span className="text-km-muted">Coupon Discount</span><span className="text-km-success">−{formatPrice(couponDiscount)}</span></div>
            )}
            <div className="flex justify-between">
              <span className="text-km-muted">Shipping</span>
              <span>{shipping === 0 ? <span className="text-km-success">FREE</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between"><span className="text-km-muted">Tax (GST)</span><span>{formatPrice(tax)}</span></div>
            {shipping > 0 && (
              <p className="text-xs text-km-orange">
                Add {formatPrice(settings.freeShippingThreshold - subtotal)} more for free delivery
              </p>
            )}
            <div className="border-t border-km-line pt-2 flex justify-between font-semibold text-base">
              <span>Total</span><span>{formatPrice(grandTotal)}</span>
            </div>
            <p className="text-xs text-km-success font-medium">
              You save {formatPrice(savings + couponDiscount)} on this order
            </p>
          </div>

          <Link href="/checkout">
            <Button className="w-full mt-4" size="lg">Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
