"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AuthGuard } from "@/components/layout/AuthGuard";
import type { Address } from "@/lib/types";

async function callAccountAction<T>(action: string, payload: unknown = {}): Promise<{ success: boolean; data?: T; message?: string }> {
  const res = await fetch("/api/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const json = await res.json();
  return { success: json.success, data: json.data, message: json.message };
}

function AddressForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: "", mobile: "", addressLine1: "", addressLine2: "", landmark: "",
    city: "", state: "", pinCode: "", isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await callAccountAction("saveAddress", form);
    setSaving(false);
    if (!result.success) {
      setError(result.message || "Could not save address.");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-km-line rounded-xl p-4 space-y-3 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        <input required placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
      </div>
      <input required placeholder="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm" />
      <input placeholder="Address Line 2 (optional)" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} className="w-full border border-km-line rounded-lg px-3 py-2 text-sm" />
      <div className="grid grid-cols-3 gap-3">
        <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        <input required placeholder="PIN Code" value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value })} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
        Set as default address
      </label>
      {error && <p className="text-sm text-km-danger">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>Save Address</Button>
      </div>
    </form>
  );
}

function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  async function load() {
    const result = await callAccountAction<Address[]>("getAddresses");
    if (!result.success) {
      if (result.message?.includes("Connect the Google Sheets")) setNotConfigured(true);
      setAddresses([]);
      return;
    }
    setAddresses(result.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(addressId: string) {
    await callAccountAction("deleteAddress", { addressId });
    load();
  }

  return (
    <Container className="py-10 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-km-blue" />
          <h1 className="font-heading font-semibold text-2xl">Saved Addresses</h1>
        </div>
        {!showForm && !notConfigured && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        )}
      </div>

      {notConfigured && (
        <p className="text-sm text-km-muted bg-km-bg-alt border border-km-line rounded-xl p-4 mb-4">
          Address management needs the Google Sheets backend connected. See apps-script/README_APPSCRIPT.md to set it up.
        </p>
      )}

      {showForm && (
        <AddressForm
          onSaved={() => { setShowForm(false); load(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {addresses === null && <p className="text-sm text-km-muted">Loading...</p>}

      {addresses !== null && addresses.length === 0 && !notConfigured && !showForm && (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          message="Add an address to make checkout faster next time."
          actionLabel="Add Address"
          actionHref="#"
        />
      )}

      {addresses !== null && addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.addressId} className="border border-km-line rounded-xl p-4 flex justify-between gap-3">
              <div className="text-sm">
                <p className="font-medium flex items-center gap-1">
                  {a.name} {a.isDefault && <Star className="h-3.5 w-3.5 fill-km-orange text-km-orange" />}
                </p>
                <p className="text-km-muted mt-1">
                  {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city}, {a.state} - {a.pinCode}
                </p>
                <p className="text-km-muted">Mobile: {a.mobile}</p>
              </div>
              <button onClick={() => handleDelete(a.addressId)} className="text-km-muted hover:text-km-danger h-fit">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

export default function AddressesPage() {
  return (
    <AuthGuard>
      <AddressesContent />
    </AuthGuard>
  );
}
