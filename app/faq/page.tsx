"use client";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How long does delivery take?", a: "Standard delivery takes 3-7 business days depending on your location." },
  { q: "What is your return policy?", a: "We offer a 7-day easy return window from the date of delivery, provided the item is unused with original tags." },
  { q: "Do you offer Cash on Delivery?", a: "Yes, COD is available on orders below ₹5,000." },
  { q: "How do I track my order?", a: "Once your order ships, you can track it from the My Orders section of your account." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Container className="py-10 max-w-2xl">
      <h1 className="font-heading font-semibold text-3xl mb-6">Frequently Asked Questions</h1>
      <div className="divide-y divide-km-line border-t border-b border-km-line">
        {faqs.map((f, i) => (
          <div key={i} className="py-4">
            <button className="flex items-center justify-between w-full text-left font-medium" onClick={() => setOpen(open === i ? null : i)}>
              {f.q}
              <ChevronDown className={`h-4 w-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="text-sm text-km-muted mt-2">{f.a}</p>}
          </div>
        ))}
      </div>
    </Container>
  );
}
