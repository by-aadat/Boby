/**
 * Server-only helper for calling the Apps Script backend directly from
 * Next.js route handlers (as opposed to adapters/sheetsAdapter.ts, which
 * is used by client components via the /api/store proxy).
 *
 * Route handlers already run server-side, so touching APPS_SCRIPT_URL /
 * API_SHARED_SECRET here never exposes them to the browser.
 */

type Envelope<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errorCode: string };

export function backendConfigured(): boolean {
  return Boolean(process.env.APPS_SCRIPT_URL && process.env.API_SHARED_SECRET);
}

export async function callAppsScript<T>(action: string, payload: unknown = {}): Promise<Envelope<T>> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.API_SHARED_SECRET;
  if (!url || !secret) {
    return { success: false, message: "Backend not configured", errorCode: "NOT_CONFIGURED" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload, secret }),
    signal: AbortSignal.timeout(20000),
  });
  return res.json();
}
