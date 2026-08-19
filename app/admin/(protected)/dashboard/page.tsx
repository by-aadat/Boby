"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { callAdminAction } from "@/lib/adminApi";
import { formatPrice, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import type { DashboardStats } from "@/lib/types";

function KpiCard({ icon: Icon, label, value, tone = "blue" }: { icon: React.ElementType; label: string; value: string; tone?: "blue" | "orange" | "success" | "warn" }) {
  const toneClasses = {
    blue: "bg-km-blue/10 text-km-blue",
    orange: "bg-km-orange/10 text-km-orange",
    success: "bg-green-50 text-km-success",
    warn: "bg-amber-50 text-km-warn",
  };
  return (
    <div className="bg-white border border-km-line rounded-xl p-4">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${toneClasses[tone]}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-xs text-km-muted">{label}</p>
      <p className="text-xl font-heading font-semibold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callAdminAction<DashboardStats>("getDashboardStats").then((res) => {
      if (!res.success) {
        setError(res.message || "Could not load dashboard");
        return;
      }
      setStats(res.data || null);
    });
  }, []);

  return (
    <div>
      <h1 className="font-heading font-semibold text-2xl mb-1">Good day, Admin</h1>
      <p className="text-sm text-km-muted mb-6">Here&apos;s what&apos;s happening with KartME today.</p>

      {error && <p className="text-sm text-km-danger bg-red-50 border border-red-100 rounded-lg p-3 mb-4">{error}</p>}

      {!stats && !error && <p className="text-sm text-km-muted">Loading dashboard...</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard icon={IndianRupee} label="Total Sales" value={formatPrice(stats.totalSales)} tone="success" />
            <KpiCard icon={IndianRupee} label="Today's Sales" value={formatPrice(stats.todaySales)} tone="orange" />
            <KpiCard icon={ShoppingBag} label="Total Orders" value={String(stats.totalOrders)} tone="blue" />
            <KpiCard icon={Clock} label="Pending Orders" value={String(stats.pendingOrders)} tone="warn" />
            <KpiCard icon={Package} label="Total Products" value={String(stats.totalProducts)} tone="blue" />
            <KpiCard icon={AlertTriangle} label="Low Stock" value={String(stats.lowStockCount)} tone="warn" />
            <KpiCard icon={AlertTriangle} label="Out of Stock" value={String(stats.outOfStockCount)} tone="warn" />
            <KpiCard icon={Users} label="Total Customers" value={String(stats.totalCustomers)} tone="blue" />
          </div>

          <div className="bg-white border border-km-line rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-km-blue hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-km-muted border-b border-km-line">
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Payment</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o.orderId} className="border-b border-km-line last:border-0">
                      <td className="py-2 pr-4 font-medium">{o.orderId}</td>
                      <td className="py-2 pr-4 text-km-muted">{formatDate(o.orderDate)}</td>
                      <td className="py-2 pr-4 tabular-nums">{formatPrice(o.grandTotal)}</td>
                      <td className="py-2 pr-4 capitalize">{o.paymentStatus}</td>
                      <td className="py-2"><Badge tone="blue">{o.orderStatus}</Badge></td>
                    </tr>
                  ))}
                  {stats.recentOrders.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-km-muted">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
