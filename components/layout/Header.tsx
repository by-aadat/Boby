"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, User, Menu, X, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { productRepo } from "@/repositories/productRepo";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const categories = [
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Kids", slug: "kids" },
  { name: "Accessories", slug: "accessories" },
  { name: "New Arrivals", slug: "new-arrivals", special: true },
  { name: "Best Sellers", slug: "best-sellers", special: true },
  { name: "Offers", slug: "offers", special: true },
];

export function Header() {
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (query.trim().length > 1) {
        const results = await productRepo.searchProducts(query, 6);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const recent = JSON.parse(localStorage.getItem("kartme_recent_searches") || "[]");
      const updated = [query, ...recent.filter((r: string) => r !== query)].slice(0, 6);
      localStorage.setItem("kartme_recent_searches", JSON.stringify(updated));
    } catch {}
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="hidden md:block bg-km-blue-dark text-white text-xs">
        <div className="mx-auto max-w-[1280px] px-6 py-1.5 flex items-center justify-between">
          <span>Free delivery on orders above ₹999</span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" /> +91 98765 43210
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 flex items-center gap-3">
        <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6 text-km-ink" />
        </button>

        <div className="hidden lg:block">
          <Logo />
        </div>
        <div className="lg:hidden mx-auto">
          <Logo variant="mark" />
        </div>

        <div ref={searchRef} className="relative flex-1 hidden md:block max-w-xl">
          <form onSubmit={submitSearch}>
            <div className="flex items-center border border-km-line rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-km-blue-light">
              <Search className="h-4 w-4 text-km-muted ml-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for shirts, kurtis, jeans..."
                className="w-full px-2 py-2 text-sm outline-none"
              />
            </div>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-km-line overflow-hidden z-50">
              {suggestions.map((p) => (
                <Link
                  key={p.productId}
                  href={`/product/${p.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-km-bg-alt"
                >
                  <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.name}</p>
                    <p className="text-xs text-km-muted">{formatPrice(p.sellingPrice)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="ml-auto flex items-center gap-4">
          <Link href={user ? "/account/profile" : "/login"} className="hidden md:flex items-center gap-1 text-sm font-medium hover:text-km-blue">
            <User className="h-5 w-5" />
            <span>{authLoading ? "..." : user ? user.fullName.split(" ")[0] : "Login"}</span>
          </Link>
          <Link href="/wishlist" className="relative">
            <Heart className="h-6 w-6 text-km-ink" />
            {wishCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-km-orange text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-6 w-6 text-km-ink" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-km-orange text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div className="md:hidden px-4 pb-3">
        <form onSubmit={submitSearch}>
          <div className="flex items-center border border-km-line rounded-xl overflow-hidden">
            <Search className="h-4 w-4 text-km-muted ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search KartME"
              className="w-full px-2 py-2 text-sm outline-none"
            />
          </div>
        </form>
      </div>

      <nav className="hidden lg:block border-t border-km-line">
        <div className="mx-auto max-w-[1280px] px-6 flex items-center gap-6 text-sm font-medium">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={c.special ? `/products?tag=${c.slug}` : `/category/${c.slug}`}
              className={`py-3 hover:text-km-orange transition-colors ${
                c.special ? "text-km-orange" : "text-km-ink"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={c.special ? `/products?tag=${c.slug}` : `/category/${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-2 text-sm font-medium border-b border-km-line last:border-0"
                >
                  {c.name}
                </Link>
              ))}
              <Link href={user ? "/account/profile" : "/login"} onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm font-medium mt-2 text-km-blue">
                {user ? `Hi, ${user.fullName.split(" ")[0]}` : "Login / Register"}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
