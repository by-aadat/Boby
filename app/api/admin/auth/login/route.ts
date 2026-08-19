import { NextRequest, NextResponse } from "next/server";
import { backendConfigured, callAppsScript } from "@/lib/appsScript";
import type { AdminProfile } from "@/lib/types";

const COOKIE_NAME = "kartme_admin_session";

export async function POST(req: NextRequest) {
  if (!backendConfigured()) {
    return NextResponse.json({
      success: false,
      message: "Admin panel requires the Google Sheets backend. See apps-script/README_APPSCRIPT.md.",
      errorCode: "NOT_CONFIGURED",
    });
  }

  const body = await req.json();
  const result = await callAppsScript<{ adminSessionToken: string; admin: AdminProfile }>("adminLogin", body);

  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message, errorCode: result.errorCode });
  }

  const res = NextResponse.json({ success: true, admin: result.data.admin });
  res.cookies.set(COOKIE_NAME, result.data.adminSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours — matches Apps Script admin session TTL
  });
  return res;
}
