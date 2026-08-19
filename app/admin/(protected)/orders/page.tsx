"use client";

import { useEffect, useState } from "react";
import { callAdminAction } from "@/lib/adminApi";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/format";
import type { AdminOrderSummary, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    const result = await callAdminAction<{ items: AdminOrderSummary[] }>("adminGetOrders", {
      status: statusFilter || undefined,
      pageSize: 100,
    });
    if (!result.success) {
      setError(result.message || "Could not load orders");
      return;
    }
    setOrders(result.data?.items || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function updateStatus(orderId: string, orderStatus: string) {
    setUpdatingId(orderId);
    await callAdminAction("updateOrderStatus", { orderId, orderStatus });
    await load();
    setUpdatingId(null);
  }

  return (
    <div>
      <h1 className="font-heading font-semibold text-2xl mb-4">Orders</h1>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border border-km-line rounded-lg px-3 py-2 text-sm bg-white mb-4"
      >
        <option value="">All Statuses</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {error && <p className="text-sm text-km-danger bg-red-50 border border-red-100 rounded-lg p-3 mb-4">{error}</p>}

      <div className="bg-white border border-km-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-km-muted border-b border-km-line">
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Payment</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId} className="border-b border-km-line last:border-0">
                <td className="py-2 px-4 font-medium">{o.orderId}</td>
                <td className="py-2 px-4 text-km-muted">{formatDate(o.orderDate)}</td>
                <td className="py-2 px-4 tabular-nums">{formatPrice(o.grandTotal)}</td>
                <td className="py-2 px-4 capitalize">{o.paymentMethod} · {o.paymentStatus}</td>
                <td className="py-2 px-4"><Badge tone="blue">{o.orderStatus}</Badge></td>
                <td className="py-2 px-4">
                  <select
                    value={o.orderStatus}
                    disabled={updatingId === o.orderId}
                    onChange={(e) => updateStatus(o.orderId, e.target.value as OrderStatus)}
                    className="border border-km-line rounded-lg px-2 py-1 text-xs"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-km-muted">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
