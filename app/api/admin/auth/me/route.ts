import { NextRequest, NextResponse } from "next/server";
import { backendConfigured, callAppsScript } from "@/lib/appsScript";
import type { AdminProfile } from "@/lib/types";

const COOKIE_NAME = "kartme_admin_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !backendConfigured()) {
    return NextResponse.json({ success: true, admin: null });
  }
  const result = await callAppsScript<AdminProfile>("getAdminProfile", { adminSessionToken: token });
  if (!result.success) return NextResponse.json({ success: true, admin: null });
  return NextResponse.json({ success: true, admin: result.data });
}
