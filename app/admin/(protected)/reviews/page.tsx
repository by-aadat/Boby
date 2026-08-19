"use client";

import { useEffect, useState } from "react";
import { Check, X, Trash2, Star, BadgeCheck } from "lucide-react";
import { callAdminAction } from "@/lib/adminApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

type AdminReview = {
  reviewId: string;
  productId: string;
  customerName: string;
  rating: number;
  review: string;
  date: string;
  verifiedPurchase: boolean;
  approvalStatus: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<string>("pending");

  async function load() {
    const result = await callAdminAction<AdminReview[]>("adminGetReviews");
    if (result.success) setReviews(result.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function moderate(reviewId: string, decision: "approve" | "reject" | "delete") {
    await callAdminAction("moderateReview", { reviewId, decision });
    load();
  }

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.approvalStatus === filter);

  return (
    <div>
      <h1 className="font-heading font-semibold text-2xl mb-4">Reviews</h1>

      <div className="flex gap-2 mb-4">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? "bg-km-blue text-white" : "bg-white border border-km-line"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.reviewId} className="bg-white border border-km-line rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-km-orange text-km-orange" : "text-km-line"}`} />
                  ))}
                </div>
                {r.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs text-km-success font-medium">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              <Badge tone={r.approvalStatus === "approved" ? "success" : r.approvalStatus === "rejected" ? "danger" : "warn"}>
                {r.approvalStatus}
              </Badge>
            </div>
            <p className="text-sm">{r.review}</p>
            <p className="text-xs text-km-muted mt-1">{r.customerName} · {formatDate(r.date)} · Product: {r.productId}</p>
            <div className="flex gap-2 mt-3">
              {r.approvalStatus !== "approved" && (
                <button onClick={() => moderate(r.reviewId, "approve")} className="flex items-center gap-1 text-xs text-km-success font-medium">
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
              )}
              {r.approvalStatus !== "rejected" && (
                <button onClick={() => moderate(r.reviewId, "reject")} className="flex items-center gap-1 text-xs text-km-warn font-medium">
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              )}
              <button onClick={() => moderate(r.reviewId, "delete")} className="flex items-center gap-1 text-xs text-km-danger font-medium">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-km-muted text-center py-8">No reviews in this category</p>}
      </div>
    </div>
  );
}
