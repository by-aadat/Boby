"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import type { AdminProfile } from "@/lib/types";

type AdminAuthResult = { success: boolean; message?: string; errorCode?: string };

type AdminAuthContextType = {
  admin: AdminProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AdminAuthResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/me");
      const data = await res.json();
      setAdmin(data.admin ?? null);
    } catch {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function login(email: string, password: string): Promise<AdminAuthResult> {
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) setAdmin(data.admin);
    return { success: data.success, message: data.message, errorCode: data.errorCode };
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    setAdmin(null);
  }

  function can(permission: string): boolean {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;
    return (admin.permissions || []).includes(permission);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout, refresh, can }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
