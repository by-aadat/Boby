import Link from "next/link";
import { AtSign, MapPin, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="bg-km-blue-dark text-white mt-8 pb-20 lg:pb-0">
      <div className="mx-auto max-w-[1280px] px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Logo theme="dark" />
          <p className="text-sm text-white/70 mt-3">
            Fashion for every occasion — Men, Women & Kids, brought to you by OmNettwear LLP, Kamla Nagar, Delhi.
          </p>
          <div className="flex gap-3 mt-4">
            <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <AtSign className="h-4 w-4 text-white/80" />
            </span>
            <span className="text-xs text-white/60 self-center">@kartme</span>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/category/men">Men</Link></li>
            <li><Link href="/category/women">Women</Link></li>
            <li><Link href="/category/kids">Kids</Link></li>
            <li><Link href="/category/accessories">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-sm">Customer Service</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/shipping">Shipping Policy</Link></li>
            <li><Link href="/returns">Return Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-sm">Get in Touch</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@kartme.in</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kamla Nagar, Delhi</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} KartME · OmNettwear LLP. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>UPI · COD · Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
