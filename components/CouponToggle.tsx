"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-canal/10 text-canal" : "bg-char/10 text-char/50"}`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
