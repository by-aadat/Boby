import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { backendConfigured, callAppsScript } from "@/lib/appsScript";
import type { CreateOrderInput, Order } from "@/lib/types";

/**
 * This is the ONLY route that creates orders against the real backend.
 * createOrder is deliberately excluded from the generic /api/store proxy
 * (see that route's BLOCKED_ACTIONS) so this file is the single place
 * that decides whether an order gets to claim "paid".
 *
 * Rule: a client can never just say paymentStatus="paid". For the online
 * payment method, we re-verify the Razorpay signature ourselves, server
 * side, using the secret key — only then do we tell Apps Script the
 * order is paid. For COD/UPI, payment status always starts "pending"
 * regardless of anything the client sends.
 */
export async function POST(req: NextRequest) {
  const body: CreateOrderInput = await req.json();

  if (!backendConfigured()) {
    return NextResponse.json({
      success: false,
      message: "Backend not configured",
      errorCode: "NOT_CONFIGURED",
    });
  }

  let paymentStatus: "pending" | "paid" = "pending";
  let transactionId = "";

  if (body.paymentMethod === "online" && body.razorpayVerification) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ success: false, message: "Payment gateway not configured", errorCode: "PAYMENT_NOT_CONFIGURED" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body.razorpayVerification;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Payment verification failed", errorCode: "PAYMENT_VERIFICATION_FAILED" });
    }

    paymentStatus = "paid";
    transactionId = razorpay_payment_id;
  }

  const result = await callAppsScript<Order>("createOrder", {
    customerName: body.customerName,
    mobile: body.mobile,
    email: body.email,
    items: body.items,
    shippingAddress: body.shippingAddress,
    paymentMethod: body.paymentMethod,
    couponCode: body.couponCode,
    paymentStatus,
    transactionId,
  });

  return NextResponse.json(result);
}
