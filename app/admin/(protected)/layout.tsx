"use client";

import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 min-w-0 p-4 sm:p-6 bg-km-bg-alt">{children}</main>
        </div>
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
