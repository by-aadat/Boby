import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a Razorpay order. Requires RAZORPAY_KEY_ID and
 * RAZORPAY_KEY_SECRET server-side env vars — if they're not set, this
 * route reports that clearly instead of failing silently, so the
 * checkout UI can fall back to COD/UPI gracefully.
 */
export async function POST(req: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({
      success: false,
      message: "Online payment isn't configured yet. Please choose Cash on Delivery or UPI.",
      errorCode: "PAYMENT_NOT_CONFIGURED",
    });
  }

  const body = await req.json();
  const amount = Math.round(Number(body.amount) * 100); // Razorpay expects paise
  if (!amount || amount < 100) {
    return NextResponse.json({ success: false, message: "Invalid amount", errorCode: "BAD_REQUEST" });
  }

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: "kartme-" + Date.now(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Razorpay order creation failed:", errText);
      return NextResponse.json({ success: false, message: "Could not initiate payment. Please try again.", errorCode: "PAYMENT_GATEWAY_ERROR" });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId, // publishable — safe to send to the browser
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ success: false, message: "Could not reach the payment gateway.", errorCode: "PAYMENT_GATEWAY_ERROR" });
  }
}
