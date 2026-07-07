"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("Cancel this order? This can't be undone.")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  }

  return (
    <div>
      {error && <p className="text-brick text-sm mb-2">{error}</p>}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full border-2 border-brick text-brick font-semibold rounded-full py-3 disabled:opacity-50"
      >
        {loading ? "Cancelling…" : "Cancel order"}
      </button>
    </div>
  );
}
