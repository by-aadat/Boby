import { NextRequest, NextResponse } from "next/server";
import { backendConfigured, callAppsScript } from "@/lib/appsScript";

const COOKIE_NAME = "kartme_admin_session";

const ALLOWED_ACTIONS = new Set([
  "getDashboardStats",
  "adminGetProducts",
  "saveProduct",
  "deleteProduct",
  "updateStock",
  "adminGetOrders",
  "updateOrderStatus",
  "adminGetCustomers",
  "toggleCustomerStatus",
  "adminGetSettings",
  "saveSettings",
  "adminGetCoupons",
  "saveCoupon",
  "deleteCoupon",
  "adminGetBanners",
  "saveBanner",
  "deleteBanner",
  "adminGetReviews",
  "moderateReview",
  "adminGetReturns",
  "updateReturnStatus",
  "getReport",
  "adminGetVariants",
  "saveVariant",
  "deleteVariant",
  "bulkImportProducts",
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
    return NextResponse.json({ success: false, message: "Backend not configured", errorCode: "NOT_CONFIGURED" });
  }

  const result = await callAppsScript(body.action, { ...body.payload, adminSessionToken: token });
  return NextResponse.json(result);
}
