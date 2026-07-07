"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ZoneForm() {
  const router = useRouter();
  const [areaName, setAreaName] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("49");
  const [etaMinutes, setEtaMinutes] = useState("25");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaName, deliveryFee: parseFloat(deliveryFee), etaMinutes: parseInt(etaMinutes, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add area");
      setAreaName("");
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
        <label className="block text-xs font-medium mb-1">Area name</label>
        <input required value={areaName} onChange={(e) => setAreaName(e.target.value)}
          placeholder="e.g. Model Town Okara" className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-56" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Delivery fee (Rs)</label>
        <input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-24" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">ETA (minutes)</label>
        <input type="number" value={etaMinutes} onChange={(e) => setEtaMinutes(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-24" />
      </div>
      <button type="submit" disabled={saving} className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50">
        {saving ? "Adding…" : "Add area"}
      </button>
      {error && <p className="text-brick text-xs w-full">{error}</p>}
    </form>
  );
}
