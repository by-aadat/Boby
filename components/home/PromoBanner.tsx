import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="py-6">
      <div className="bg-km-blue rounded-2xl p-8 sm:p-12 text-center">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
          New Customer Offer — Flat ₹200 OFF
        </h2>
        <p className="text-white/80 mt-2 text-sm sm:text-base">
          Use code <span className="font-semibold text-white">KARTME200</span> on your first order above ₹999
        </p>
        <Link href="/products">
          <Button variant="primary" size="lg" className="mt-5">
            Shop Now
          </Button>
        </Link>
      </div>
    </section>
  );
}
