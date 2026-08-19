import { NextRequest, NextResponse } from "next/server";
import { backendConfigured, callAppsScript } from "@/lib/appsScript";
import { registerMockUser } from "@/lib/mockAuthStore";
import type { CustomerProfile } from "@/lib/types";

const COOKIE_NAME = "kartme_session";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (backendConfigured()) {
    const result = await callAppsScript<{ sessionToken: string; profile: CustomerProfile }>(
      "registerCustomer",
      body
    );
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message, errorCode: result.errorCode }, { status: 200 });
    }
    const res = NextResponse.json({ success: true, profile: result.data.profile });
    res.cookies.set(COOKIE_NAME, result.data.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  // Mock mode — in-memory dev store, see lib/mockAuthStore.ts
  const result = registerMockUser(body);
  if (result.error) {
    return NextResponse.json({ success: false, message: result.error, errorCode: "VALIDATION" }, { status: 200 });
  }
  const res = NextResponse.json({ success: true, profile: result.profile });
  res.cookies.set(COOKIE_NAME, result.sessionToken!, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
