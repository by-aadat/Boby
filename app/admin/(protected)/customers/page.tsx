"use client";

import { useEffect, useState } from "react";
import { callAdminAction } from "@/lib/adminApi";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/format";
import type { AdminCustomerSummary } from "@/lib/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const result = await callAdminAction<AdminCustomerSummary[]>("adminGetCustomers");
    if (!result.success) {
      setError(result.message || "Could not load customers");
      return;
    }
    setCustomers(result.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(customerId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    await callAdminAction("toggleCustomerStatus", { customerId, status: newStatus });
    load();
  }

  return (
    <div>
      <h1 className="font-heading font-semibold text-2xl mb-4">Customers</h1>

      {error && <p className="text-sm text-km-danger bg-red-50 border border-red-100 rounded-lg p-3 mb-4">{error}</p>}

      <div className="bg-white border border-km-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-km-muted border-b border-km-line">
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Contact</th>
              <th className="py-2 px-4">Joined</th>
              <th className="py-2 px-4">Orders</th>
              <th className="py-2 px-4">Total Spent</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customerId} className="border-b border-km-line last:border-0">
                <td className="py-2 px-4">
                  <p className="font-medium">{c.fullName}</p>
                  <p className="text-xs text-km-muted">{c.customerId}</p>
                </td>
                <td className="py-2 px-4 text-km-muted">{c.mobile}<br />{c.email}</td>
                <td className="py-2 px-4 text-km-muted">{formatDate(c.registrationDate)}</td>
                <td className="py-2 px-4 tabular-nums">{c.totalOrders}</td>
                <td className="py-2 px-4 tabular-nums">{formatPrice(c.totalSpent)}</td>
                <td className="py-2 px-4">
                  <Badge tone={c.accountStatus === "active" ? "success" : "danger"}>{c.accountStatus}</Badge>
                </td>
                <td className="py-2 px-4">
                  <button onClick={() => toggleStatus(c.customerId, c.accountStatus)} className="text-xs text-km-blue underline">
                    {c.accountStatus === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-km-muted">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
