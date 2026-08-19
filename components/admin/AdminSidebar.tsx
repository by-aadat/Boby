"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Tag,
  Image as ImageIcon,
  Star,
  FileBarChart,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "products" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "orders" },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw, permission: "orders" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers" },
  { href: "/admin/coupons", label: "Coupons", icon: Tag, permission: "coupons" },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon, permission: "banners" },
  { href: "/admin/reviews", label: "Reviews", icon: Star, permission: "reviews" },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart, permission: "reports" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout, can } = useAdminAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));

  const content = (
    <>
      <div className="p-4 border-b border-km-line">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                active ? "bg-km-blue text-white" : "text-km-ink hover:bg-km-bg-alt"
              }`}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-km-line">
        <p className="text-xs text-km-muted px-3 mb-2">
          {admin?.name} · <span className="capitalize">{admin?.role.replace("_", " ")}</span>
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-km-danger hover:bg-red-50 w-full"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-km-line bg-white sticky top-0 z-30">
        <Logo />
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-km-line bg-white h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
