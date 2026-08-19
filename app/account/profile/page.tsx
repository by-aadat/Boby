"use client";

import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function ProfileContent() {
  const { user, logout, refresh } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateProfile", payload: { fullName } }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Profile updated.");
        refresh();
      } else {
        setMessage(data.message || "Could not update profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (!user) return null;

  return (
    <Container className="py-10 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-km-blue" />
          <h1 className="font-heading font-semibold text-2xl">My Profile</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-km-danger">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input value={user.email} disabled className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm bg-km-bg-alt text-km-muted" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Mobile</label>
          <input value={user.mobile} disabled className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm bg-km-bg-alt text-km-muted" />
        </div>
        <p className="text-xs text-km-muted">Customer ID: {user.customerId}</p>

        <Button type="submit" loading={saving}>Save Changes</Button>
        {message && <p className="text-sm text-km-muted">{message}</p>}
      </form>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
