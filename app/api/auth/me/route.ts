import { NextRequest, NextResponse } from "next/server";
import { backendConfigured, callAppsScript } from "@/lib/appsScript";
import { verifyMockSession, getMockProfile } from "@/lib/mockAuthStore";
import type { CustomerProfile } from "@/lib/types";

const COOKIE_NAME = "kartme_session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ success: true, profile: null });

  if (backendConfigured()) {
    const result = await callAppsScript<CustomerProfile>("getProfile", { sessionToken: token });
    if (!result.success) return NextResponse.json({ success: true, profile: null });
    return NextResponse.json({ success: true, profile: result.data });
  }

  const customerId = verifyMockSession(token);
  if (!customerId) return NextResponse.json({ success: true, profile: null });
  const profile = getMockProfile(customerId);
  return NextResponse.json({ success: true, profile });
}
