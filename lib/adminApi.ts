"use client";

export async function callAdminAction<T>(
  action: string,
  payload: unknown = {}
): Promise<{ success: boolean; data?: T; message?: string; errorCode?: string }> {
  const res = await fetch("/api/admin/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const json = await res.json();
  return { success: json.success, data: json.data, message: json.message, errorCode: json.errorCode };
}
