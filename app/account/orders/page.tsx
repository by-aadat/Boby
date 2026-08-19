"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { PackageSearch } from "lucide-react";
import { orderRepo } from "@/repositories/productRepo";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let refs: { orderId: string; mobile: string }[] = [];
    try {
      refs = JSON.parse(localStorage.getItem("kartme_my_orders") || "[]");
    } catch {
      refs = [];
    }

    if (refs.length === 0) {
      setOrders([]);
      return;
    }

    Promise.all(refs.map((r) => orderRepo.getOrder(r.orderId))).then((results) => {
      setOrders(results.filter((o): o is Order => o !== null));
    });
  }, []);

  return (
    <Container className="py-10">
      <h1 className="font-heading font-semibold text-2xl mb-6">My Orders</h1>

      {orders === null && <p className="text-sm text-km-muted">Loading your orders...</p>}

      {orders !== null && orders.length === 0 && (
        <EmptyState
          icon={PackageSearch}
          title="No orders yet"
          message="Once you place an order, it will show up here with full tracking."
          actionLabel="Continue Shopping"
          actionHref="/products"
        />
      )}

      {orders !== null && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.orderId}
              href={`/order/${order.orderId}/confirmation`}
              className="block border border-km-line rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">{order.orderId}</p>
                  <p className="text-xs text-km-muted">{formatDate(order.orderDate)} · {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={order.orderStatus === "Delivered" ? "success" : order.orderStatus === "Cancelled" ? "danger" : "blue"}>
                    {order.orderStatus}
                  </Badge>
                  <span className="font-semibold text-sm tabular-nums">{formatPrice(order.grandTotal)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
