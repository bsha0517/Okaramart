"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Failed to create coupon");
      setCode(""); setDiscountValue(""); setMinOrderValue(""); setExpiresAt("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-canal/10 rounded-xl p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Code</label>
        <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-32" placeholder="OKARA10" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm">
          <option value="PERCENT">% off</option>
          <option value="FLAT">Rs off</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Value</label>
        <input required type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-20" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Min order (Rs)</label>
        <input type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-28" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Expires</label>
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={saving} className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50">
        {saving ? "Adding…" : "Add coupon"}
      </button>
      {error && <p className="text-brick text-xs w-full">{error}</p>}
    </form>
  );
}
