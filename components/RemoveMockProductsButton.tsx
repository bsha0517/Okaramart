"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveMockProductsButton({ mockCount }: { mockCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (mockCount === 0) return null;

  async function handleClick() {
    if (!confirm(`Remove all ${mockCount} sample products? This can't be undone.`)) return;
    setLoading(true);
    const res = await fetch("/api/products/mock", { method: "DELETE" });
    const data = await res.json();
    setLoading(false);
    setMessage(data.note || `Removed ${data.deleted} sample products.`);
    router.refresh();
  }

  return (
    <div className="mb-4">
      <button
        onClick={handleClick}
        disabled={loading}
        className="border border-brick/30 text-brick text-sm font-semibold rounded-full px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Removing…" : `Remove ${mockCount} sample products`}
      </button>
      {message && <p className="text-xs text-char/50 mt-1">{message}</p>}
    </div>
  );
}
