import { NextRequest, NextResponse } from "next/server";

/**
 * The ONLY place in the whole app that knows the Apps Script URL and the
 * shared secret. Both come from server-side environment variables (no
 * NEXT_PUBLIC_ prefix), so they are never bundled into client JavaScript.
 *
 * The browser calls this route; this route calls Apps Script; Apps Script
 * talks to Google Sheets. See KartME_Phase2_Build_Prompt.md for the full
 * architecture rationale.
 */

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const API_SHARED_SECRET = process.env.API_SHARED_SECRET;

// createOrder is deliberately NOT reachable through this generic proxy —
// it must go through /api/orders/create, which verifies payment
// server-side before ever marking an order "paid". Routing it through
// here would let a client claim paymentStatus="paid" for free.
const BLOCKED_ACTIONS = new Set(["createOrder"]);

export async function POST(req: NextRequest) {
  if (!APPS_SCRIPT_URL || !API_SHARED_SECRET) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Backend not configured. Set APPS_SCRIPT_URL and API_SHARED_SECRET in your environment.",
        errorCode: "NOT_CONFIGURED",
      },
      { status: 200 }
    );
  }

  let body: { action?: string; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body", errorCode: "BAD_REQUEST" },
      { status: 200 }
    );
  }

  if (!body.action) {
    return NextResponse.json(
      { success: false, message: "Missing action", errorCode: "BAD_REQUEST" },
      { status: 200 }
    );
  }

  if (BLOCKED_ACTIONS.has(body.action)) {
    return NextResponse.json(
      { success: false, message: "This action must go through a dedicated secure route", errorCode: "FORBIDDEN" },
      { status: 200 }
    );
  }

  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: body.action,
        payload: body.payload || {},
        secret: API_SHARED_SECRET,
      }),
      // Apps Script cold starts can be slow; give it real headroom.
      signal: AbortSignal.timeout(20000),
    });

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Apps Script proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Could not reach the backend. Please try again.", errorCode: "UPSTREAM_ERROR" },
      { status: 200 }
    );
  }
}
