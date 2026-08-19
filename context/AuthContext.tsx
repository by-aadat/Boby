"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import type { CustomerProfile } from "@/lib/types";

type AuthResult = { success: boolean; message?: string; errorCode?: string };

type AuthContextType = {
  user: CustomerProfile | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<AuthResult>;
  register: (input: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
    gender: string;
    dob?: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.profile ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function login(identifier: string, password: string): Promise<AuthResult> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (data.success) setUser(data.profile);
    return { success: data.success, message: data.message, errorCode: data.errorCode };
  }

  async function register(input: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
    gender: string;
    dob?: string;
  }): Promise<AuthResult> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (data.success) setUser(data.profile);
    return { success: data.success, message: data.message, errorCode: data.errorCode };
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
