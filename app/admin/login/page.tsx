"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAdminAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message || "Login failed");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-km-bg-alt px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-km-line p-8">
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <div className="flex items-center gap-1.5 mt-3 text-km-muted text-sm">
            <ShieldCheck className="h-4 w-4" /> Admin Panel
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
              placeholder="admin@kartme.in"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
            />
          </div>
          {error && <p className="text-sm text-km-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-xs text-km-muted text-center mt-6">
          Don&apos;t have an admin account? Create one from your Google Sheet:
          <br />
          <span className="font-medium">KartME → 4. Create First Admin User</span>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <AdminLoginForm />
    </AdminAuthProvider>
  );
}
