"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact form submitted (logged only in this phase)");
    setSent(true);
  }

  return (
    <Container className="py-10">
      <h1 className="font-heading font-semibold text-3xl mb-6">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4 text-sm">
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-km-blue" /> +91 98765 43210</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-km-blue" /> support@kartme.in</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-km-blue" /> Kamla Nagar, Delhi - 110007</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Your Name" className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
          <input required type="email" placeholder="Your Email" className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
          <textarea required placeholder="Your Message" rows={4} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
          <Button type="submit">Send Message</Button>
          {sent && <p className="text-sm text-km-success">Thanks! We'll get back to you shortly.</p>}
        </form>
      </div>
    </Container>
  );
}
