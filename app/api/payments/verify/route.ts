import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Verifies a Razorpay payment signature. This is the step that actually
 * proves the payment happened — never trust a "payment succeeded" message
 * from the browser alone, since that can be faked. Only after this
 * verification passes should an order be marked as paid.
 */
export async function POST(req: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ success: false, message: "Payment gateway not configured", errorCode: "PAYMENT_NOT_CONFIGURED" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ success: false, message: "Missing payment details", errorCode: "BAD_REQUEST" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const valid = expectedSignature === razorpay_signature;

  if (!valid) {
    console.error("Razorpay signature mismatch for order", razorpay_order_id);
    return NextResponse.json({ success: false, message: "Payment verification failed", errorCode: "PAYMENT_VERIFICATION_FAILED" });
  }

  return NextResponse.json({ success: true, transactionId: razorpay_payment_id });
}
