import { NextRequest, NextResponse } from "next/server";
import { backendConfigured, callAppsScript } from "@/lib/appsScript";

const COOKIE_NAME = "kartme_session";

// Actions that require a logged-in customer. Each one is called with the
// session token from the httpOnly cookie merged into its payload — the
// browser never sees or handles the token directly.
const ALLOWED_ACTIONS = new Set([
  "getProfile",
  "updateProfile",
  "changePassword",
  "getAddresses",
  "saveAddress",
  "deleteAddress",
  "getWishlist",
  "addToWishlist",
  "removeFromWishlist",
  "requestReturn",
]);

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated", errorCode: "UNAUTHORIZED" });
  }

  const body = await req.json();
  if (!body.action || !ALLOWED_ACTIONS.has(body.action)) {
    return NextResponse.json({ success: false, message: "Unknown action", errorCode: "UNKNOWN_ACTION" });
  }

  if (!backendConfigured()) {
    return NextResponse.json({
      success: false,
      message: "Connect the Google Sheets backend to use addresses, wishlist sync, and profile editing.",
      errorCode: "NOT_CONFIGURED",
    });
  }

  const result = await callAppsScript(body.action, { ...body.payload, sessionToken: token });
  return NextResponse.json(result);
}
