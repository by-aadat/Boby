"use client";

import { useEffect, useState } from "react";
import { callAdminAction } from "@/lib/adminApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

const RETURN_STATUSES = [
  "Requested", "Under Review", "Approved", "Rejected",
  "Pickup Scheduled", "Received", "Refund Initiated", "Refunded",
];

type ReturnRequest = {
  returnId: string;
  orderId: string;
  productId: string;
  quantity: number;
  reason: string;
  description: string;
  requestDate: string;
  status: string;
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    const result = await callAdminAction<ReturnRequest[]>("adminGetReturns");
    if (result.success) setReturns(result.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(returnId: string, status: string) {
    setUpdatingId(returnId);
    await callAdminAction("updateReturnStatus", { returnId, status });
    await load();
    setUpdatingId(null);
  }

  return (
    <div>
      <h1 className="font-heading font-semibold text-2xl mb-4">Return Requests</h1>

      <div className="bg-white border border-km-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-km-muted border-b border-km-line">
              <th className="py-2 px-4">Return ID</th>
              <th className="py-2 px-4">Order</th>
              <th className="py-2 px-4">Reason</th>
              <th className="py-2 px-4">Requested</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Update</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.returnId} className="border-b border-km-line last:border-0">
                <td className="py-2 px-4 font-medium">{r.returnId}</td>
                <td className="py-2 px-4">{r.orderId}</td>
                <td className="py-2 px-4">{r.reason}</td>
                <td className="py-2 px-4 text-km-muted">{formatDate(r.requestDate)}</td>
                <td className="py-2 px-4"><Badge tone="blue">{r.status}</Badge></td>
                <td className="py-2 px-4">
                  <select
                    value={r.status}
                    disabled={updatingId === r.returnId}
                    onChange={(e) => updateStatus(r.returnId, e.target.value)}
                    className="border border-km-line rounded-lg px-2 py-1 text-xs"
                  >
                    {RETURN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-km-muted">No return requests</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
