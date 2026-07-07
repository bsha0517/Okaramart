"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ZoneRow({ zone }: { zone: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/delivery-zones/${zone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !zone.isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Remove "${zone.areaName}"?`)) return;
    await fetch(`/api/delivery-zones/${zone.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-t border-canal/5">
      <td className="px-4 py-3 font-medium">{zone.areaName}</td>
      <td className="px-4 py-3">Rs {Number(zone.deliveryFee).toFixed(0)}</td>
      <td className="px-4 py-3">{zone.etaMinutes} min</td>
      <td className="px-4 py-3">
        <button onClick={toggle} disabled={loading}
          className={`px-2 py-1 rounded-full text-xs font-medium ${zone.isActive ? "bg-canal/10 text-canal" : "bg-char/10 text-char/50"}`}>
          {zone.isActive ? "Active" : "Hidden"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={remove} className="text-brick text-xs font-medium">Delete</button>
      </td>
    </tr>
  );
}
