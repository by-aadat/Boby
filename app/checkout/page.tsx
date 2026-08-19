"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, MapPin, ClipboardList, CreditCard, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/context/CartContext";
import { orderRepo } from "@/repositories/productRepo";
import { formatPrice } from "@/lib/format";
import type { PaymentMethod, ShippingAddress } from "@/lib/types";
import settings from "@/mock/settings.json";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const STEPS = ["Information", "Address", "Summary", "Payment"] as const;
type Step = (typeof STEPS)[number];

const infoSchema = z.object({
  customerName: z.string().min(2, "Enter your full name"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email address"),
});
type InfoForm = z.infer<typeof infoSchema>;

const addressSchema = z.object({
  name: z.string().min(2, "Enter recipient name"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine1: z.string().min(5, "Enter your address"),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
});
type AddressForm = z.infer<typeof addressSchema>;

const STORAGE_INFO_KEY = "kartme_checkout_info";
const STORAGE_ADDRESS_KEY = "kartme_checkout_address";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalMrp, savings, clearCart } = useCart();

  const [step, setStep] = useState<Step>("Information");
  const [info, setInfo] = useState<InfoForm | null>(null);
  const [address, setAddress] = useState<AddressForm | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const infoForm = useForm<InfoForm>({ resolver: zodResolver(infoSchema) });
  const addressForm = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem(STORAGE_INFO_KEY);
      if (savedInfo) infoForm.reset(JSON.parse(savedInfo));
      const savedAddress = localStorage.getItem(STORAGE_ADDRESS_KEY);
      if (savedAddress) addressForm.reset(JSON.parse(savedAddress));
    } catch {
      // ignore corrupt storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shipping = subtotal >= settings.freeShippingThreshold || items.length === 0 ? 0 : settings.shippingCharge;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping + tax;

  function submitInfo(data: InfoForm) {
    setInfo(data);
    localStorage.setItem(STORAGE_INFO_KEY, JSON.stringify(data));
    setStep("Address");
  }

  function submitAddress(data: AddressForm) {
    setAddress(data);
    localStorage.setItem(STORAGE_ADDRESS_KEY, JSON.stringify(data));
    setStep("Summary");
  }

  async function placeOrder() {
    if (!info || !address) return;
    setPlacing(true);
    setOrderError(null);

    const shippingAddress: ShippingAddress = { ...address };
    const baseInput = {
      customerName: info.customerName,
      mobile: info.mobile,
      email: info.email,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        sku: i.sku,
        name: i.name,
        image: i.image,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
      shippingAddress,
      paymentMethod,
    };

    try {
      if (paymentMethod === "online") {
        await placeOrderWithRazorpay(baseInput);
      } else {
        const order = await orderRepo.createOrder(baseInput);
        finishOrder(order.orderId, info.mobile);
      }
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Could not place your order. Please try again.");
      setPlacing(false);
    }
  }

  async function placeOrderWithRazorpay(baseInput: Omit<Parameters<typeof orderRepo.createOrder>[0], "razorpayVerification">) {
    const initRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: grandTotal }),
    });
    const initData = await initRes.json();

    if (!initData.success) {
      // Gateway not configured — tell the person plainly and let them pick another method.
      setOrderError(initData.message || "Online payment isn't available right now. Please choose Cash on Delivery or UPI.");
      setPlacing(false);
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      setOrderError("Payment widget failed to load. Please check your connection and try again.");
      setPlacing(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: initData.keyId,
      amount: initData.amount,
      currency: initData.currency,
      order_id: initData.razorpayOrderId,
      name: "KartME",
      description: "Order payment",
      prefill: { name: info?.customerName, email: info?.email, contact: info?.mobile },
      theme: { color: "#154897" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const order = await orderRepo.createOrder({ ...baseInput, razorpayVerification: response });
          finishOrder(order.orderId, info?.mobile || "");
        } catch (err) {
          setOrderError(err instanceof Error ? err.message : "Payment succeeded but order creation failed. Contact support with your payment ID: " + response.razorpay_payment_id);
          setPlacing(false);
        }
      },
      modal: {
        ondismiss: () => setPlacing(false),
      },
    });
    rzp.open();
  }

  function finishOrder(orderId: string, mobile: string) {
    try {
      const mine = JSON.parse(localStorage.getItem("kartme_my_orders") || "[]");
      localStorage.setItem("kartme_my_orders", JSON.stringify([{ orderId, mobile }, ...mine]));
    } catch {
      // non-critical
    }
    clearCart();
    router.push(`/order/${orderId}/confirmation`);
  }

  if (items.length === 0) {
    return (
      <Container>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add a few items to your cart before checking out."
          actionLabel="Continue Shopping"
          actionHref="/products"
        />
      </Container>
    );
  }

  const stepIcons = { Information: Check, Address: MapPin, Summary: ClipboardList, Payment: CreditCard };
  const currentIndex = STEPS.indexOf(step);

  return (
    <Container className="py-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="font-heading font-semibold text-2xl mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8 overflow-x-auto scrollbar-hide">
        {STEPS.map((s, i) => {
          const Icon = stepIcons[s];
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center border-2 ${
                    done
                      ? "bg-km-success border-km-success text-white"
                      : active
                      ? "border-km-blue text-km-blue"
                      : "border-km-line text-km-muted"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs ${active ? "text-km-ink font-medium" : "text-km-muted"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-10 sm:w-16 mx-2 ${done ? "bg-km-success" : "bg-km-line"}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {step === "Information" && (
            <form onSubmit={infoForm.handleSubmit(submitInfo)} className="space-y-4 max-w-md">
              <h2 className="font-heading font-semibold text-lg mb-2">Your Information</h2>
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input {...infoForm.register("customerName")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
                {infoForm.formState.errors.customerName && <p className="text-xs text-km-danger mt-1">{infoForm.formState.errors.customerName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mobile Number</label>
                <input {...infoForm.register("mobile")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" placeholder="9876543210" />
                {infoForm.formState.errors.mobile && <p className="text-xs text-km-danger mt-1">{infoForm.formState.errors.mobile.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input {...infoForm.register("email")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
                {infoForm.formState.errors.email && <p className="text-xs text-km-danger mt-1">{infoForm.formState.errors.email.message}</p>}
              </div>
              <Button type="submit" size="lg">Continue to Address</Button>
            </form>
          )}

          {step === "Address" && (
            <form onSubmit={addressForm.handleSubmit(submitAddress)} className="space-y-4 max-w-md">
              <h2 className="font-heading font-semibold text-lg mb-2">Delivery Address</h2>
              <div>
                <label className="text-sm font-medium mb-1 block">Recipient Name</label>
                <input {...addressForm.register("name")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
                {addressForm.formState.errors.name && <p className="text-xs text-km-danger mt-1">{addressForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mobile Number</label>
                <input {...addressForm.register("mobile")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
                {addressForm.formState.errors.mobile && <p className="text-xs text-km-danger mt-1">{addressForm.formState.errors.mobile.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Address Line 1</label>
                <input {...addressForm.register("addressLine1")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" placeholder="House no., street" />
                {addressForm.formState.errors.addressLine1 && <p className="text-xs text-km-danger mt-1">{addressForm.formState.errors.addressLine1.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Address Line 2 <span className="text-km-muted">(optional)</span></label>
                <input {...addressForm.register("addressLine2")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Landmark <span className="text-km-muted">(optional)</span></label>
                <input {...addressForm.register("landmark")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">City</label>
                  <input {...addressForm.register("city")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
                  {addressForm.formState.errors.city && <p className="text-xs text-km-danger mt-1">{addressForm.formState.errors.city.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">State</label>
                  <input {...addressForm.register("state")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
                  {addressForm.formState.errors.state && <p className="text-xs text-km-danger mt-1">{addressForm.formState.errors.state.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">PIN Code</label>
                <input {...addressForm.register("pinCode")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" placeholder="110007" />
                {addressForm.formState.errors.pinCode && <p className="text-xs text-km-danger mt-1">{addressForm.formState.errors.pinCode.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("Information")}>Back</Button>
                <Button type="submit" size="lg">Continue to Summary</Button>
              </div>
            </form>
          )}

          {step === "Summary" && (
            <div className="max-w-md">
              <h2 className="font-heading font-semibold text-lg mb-3">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 border border-km-line rounded-lg p-2">
                    <div className="relative h-16 w-14 shrink-0 rounded overflow-hidden bg-km-bg-alt">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="line-clamp-1">{item.name}</p>
                      <p className="text-xs text-km-muted">Size {item.size} · {item.color} · Qty {item.quantity}</p>
                      <p className="font-medium mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-km-line rounded-lg p-3 mb-4 text-sm">
                <p className="font-medium mb-1">Deliver to:</p>
                <p className="text-km-muted">
                  {address?.name}, {address?.addressLine1}{address?.addressLine2 ? `, ${address.addressLine2}` : ""}, {address?.city}, {address?.state} - {address?.pinCode}
                </p>
                <p className="text-km-muted">Mobile: {address?.mobile}</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("Address")}>Back</Button>
                <Button size="lg" onClick={() => setStep("Payment")}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === "Payment" && (
            <div className="max-w-md">
              <h2 className="font-heading font-semibold text-lg mb-3">Payment Method</h2>
              <div className="space-y-2 mb-4">
                {[
                  { id: "cod" as const, label: "Cash on Delivery", desc: "Pay when your order arrives" },
                  { id: "upi" as const, label: "UPI", desc: "Pay via GPay, PhonePe, Paytm" },
                  { id: "online" as const, label: "Card / Net Banking / UPI (Razorpay)", desc: "Secure payment via Razorpay — falls back to COD/UPI if not yet configured" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${
                      paymentMethod === opt.id ? "border-km-blue bg-km-bg-alt" : "border-km-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-km-muted">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {orderError && <p className="text-sm text-km-danger mb-3">{orderError}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("Summary")} disabled={placing}>Back</Button>
                <Button size="lg" onClick={placeOrder} loading={placing}>
                  Place Order · {formatPrice(grandTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order total sidebar, visible at every step */}
        <div className="border border-km-line rounded-xl p-4 h-fit lg:sticky lg:top-24">
          <h3 className="font-heading font-semibold mb-3">{items.length} item{items.length > 1 ? "s" : ""}</h3>
          <div className="space-y-2 text-sm tabular-nums">
            <div className="flex justify-between"><span className="text-km-muted">MRP Total</span><span>{formatPrice(totalMrp)}</span></div>
            <div className="flex justify-between"><span className="text-km-muted">Discount</span><span className="text-km-success">−{formatPrice(savings)}</span></div>
            <div className="flex justify-between"><span className="text-km-muted">Shipping</span><span>{shipping === 0 ? <span className="text-km-success">FREE</span> : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-km-muted">Tax (GST)</span><span>{formatPrice(tax)}</span></div>
            <div className="border-t border-km-line pt-2 flex justify-between font-semibold text-base">
              <span>Total</span><span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
