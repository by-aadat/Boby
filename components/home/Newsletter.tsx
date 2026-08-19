"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <section className="py-10">
      <div className="bg-km-blue-dark rounded-2xl p-8 sm:p-12 text-center">
        <Mail className="h-8 w-8 text-white mx-auto mb-3" />
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-white">
          Get 10% off your first order
        </h2>
        <p className="text-white/70 text-sm mt-1">Subscribe for exclusive deals and new arrivals</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mt-5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          />
          <Button type="submit" variant="primary">Subscribe</Button>
        </form>
        {subscribed && <p className="text-km-success bg-white inline-block px-3 py-1 rounded-full text-xs mt-3 font-medium">Subscribed successfully!</p>}
      </div>
    </section>
  );
}
