"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Categories", icon: LayoutGrid },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account/profile", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-km-line flex lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        const badge = href === "/cart" ? cartCount : href === "/wishlist" ? wishCount : 0;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 relative ${
              active ? "text-km-blue" : "text-km-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">{label}</span>
            {badge > 0 && (
              <span className="absolute top-1 right-1/4 bg-km-orange text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
