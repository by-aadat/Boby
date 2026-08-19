"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Package, Truck, Home as HomeIcon, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { orderRepo } from "@/repositories/productRepo";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/lib/types";
import { PackageX } from "lucide-react";

const RETURN_REASONS = [
  "Size doesn't fit", "Product damaged", "Wrong item received",
  "Quality not as expected", "Changed my mind", "Other",
];

function ReturnRequestForm({ order, onDone }: { order: Order; onDone: () => void }) {
  const [productId, setProductId] = useState(order.items[0]?.productId || "");
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "requestReturn", payload: { orderId: order.orderId, productId, reason, description, quantity: 1 } }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!data.success) {
      setError(data.message || "Could not submit return request. Note: returns are only available within 7 days of delivery, and you must be logged in.");
      return;
    }
    setDone(true);
    setTimeout(onDone, 1500);
  }

  if (done) return <p className="text-sm text-km-success">Return request submitted! We'll review it shortly.</p>;

  return (
    <form onSubmit={handleSubmit} className="border border-km-line rounded-xl p-4 space-y-3 mt-4">
      <h3 className="font-medium text-sm">Request a Return</h3>
      <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm">
        {order.items.map((i) => <option key={i.variantId} value={i.productId}>{i.name}</option>)}
      </select>
      <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm">
        {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Additional details (optional)"
        rows={2}
        className="w-full border border-km-line rounded-lg px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-km-danger">{error}</p>}
      <Button type="submit" size="sm" loading={submitting}>Submit Return Request</Button>
    </form>
  );
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      orderRepo.getOrder(id).then(setOrder);
    });
  }, [params]);

  if (order === undefined) {
    return (
      <Container className="py-16 text-center text-km-muted">Loading your order...</Container>
    );
  }

  if (order === null) {
    return (
      <Container>
        <EmptyState
          icon={PackageX}
          title="Order not found"
          message="We couldn't find this order. It may have expired from local demo storage, or the link is incorrect."
          actionLabel="Continue Shopping"
          actionHref="/products"
        />
      </Container>
    );
  }

  const timeline = ["Order Placed", "Processing", "Shipped", "Delivered"];
  const currentStep = timeline.indexOf(order.orderStatus) === -1 ? 0 : timeline.indexOf(order.orderStatus);

  return (
    <Container className="py-10 max-w-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-km-success mb-3" />
        <h1 className="font-heading font-bold text-2xl">Order Placed Successfully!</h1>
        <p className="text-km-muted mt-1">
          Order ID: <span className="font-semibold text-km-ink">{order.orderId}</span>
        </p>
        <p className="text-sm text-km-muted mt-1">
          Expected delivery by {formatDate(order.expectedDelivery)}
        </p>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between mb-10 px-2">
        {timeline.map((label, i) => {
          const Icon = [CheckCircle2, Package, Truck, HomeIcon][i];
          const done = i <= currentStep;
          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= currentStep ? "bg-km-success" : "bg-km-line"}`} style={{ zIndex: 0 }} />
              )}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${done ? "bg-km-success text-white" : "bg-km-line text-km-muted"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1 text-center">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="border border-km-line rounded-xl p-4 mb-4">
        <h2 className="font-heading font-semibold mb-3">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.variantId} className="flex gap-3">
              <div className="relative h-16 w-14 shrink-0 rounded overflow-hidden bg-km-bg-alt">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0 text-sm">
                <p className="line-clamp-1">{item.name}</p>
                <p className="text-xs text-km-muted">Size {item.size} · {item.color} · Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="border border-km-line rounded-xl p-4">
          <h3 className="font-medium text-sm mb-2">Delivery Address</h3>
          <p className="text-sm text-km-muted">
            {order.shippingAddress.name}<br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}<br />
            Mobile: {order.shippingAddress.mobile}
          </p>
        </div>
        <div className="border border-km-line rounded-xl p-4">
          <h3 className="font-medium text-sm mb-2">Payment Summary</h3>
          <div className="text-sm space-y-1 tabular-nums">
            <div className="flex justify-between"><span className="text-km-muted">Subtotal</span><span>{formatPrice(order.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-km-muted">Shipping</span><span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-km-muted">Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-semibold border-t border-km-line pt-1 mt-1"><span>Total</span><span>{formatPrice(order.grandTotal)}</span></div>
            <p className="text-xs text-km-muted mt-2 capitalize">Payment method: {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center mt-6">
        <Link href="/account/orders"><Button variant="outline">View My Orders</Button></Link>
        <Link href="/products"><Button>Continue Shopping</Button></Link>
      </div>

      {order.orderStatus === "Delivered" && (
        <div className="mt-6">
          {!showReturnForm ? (
            <button
              onClick={() => setShowReturnForm(true)}
              className="flex items-center gap-1.5 text-sm text-km-blue mx-auto"
            >
              <RotateCcw className="h-4 w-4" /> Request a Return
            </button>
          ) : (
            <ReturnRequestForm order={order} onDone={() => setShowReturnForm(false)} />
          )}
        </div>
      )}
    </Container>
  );
}
