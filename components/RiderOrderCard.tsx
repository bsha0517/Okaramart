"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RiderOrderCard({ order, mine }: { order: any; mine: boolean }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setLoading(true);
    await fetch(`/api/orders/${order.id}/assign-rider`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  async function updateStatus(status: string) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, otp: status === "DELIVERED" ? otp : undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  }

  return (
    <div className="bg-white border border-canal/10 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">{order.orderNumber}</p>
          <p className="text-xs text-char/50">{order.customer.name} · {order.customer.phone}</p>
        </div>
        <span className="text-xs bg-canal/10 text-canal rounded-full px-2 py-1 font-medium">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>
      <p className="text-sm text-char/70 mb-1">{order.addressSnapshot}</p>
      <p className="text-xs text-char/50 mb-3">{order.items.length} items · Rs {Number(order.total).toFixed(0)} · {order.paymentMethod}</p>

      {error && <p className="text-brick text-xs mb-2">{error}</p>}

      {!mine && (
        <button onClick={claim} disabled={loading} className="w-full bg-canal text-husk text-sm font-semibold rounded-full py-2 disabled:opacity-50">
          Pick up this order
        </button>
      )}

      {mine && order.status === "PACKED" && (
        <button onClick={() => updateStatus("OUT_FOR_DELIVERY")} disabled={loading} className="w-full bg-canal text-husk text-sm font-semibold rounded-full py-2 disabled:opacity-50">
          Start delivery
        </button>
      )}

      {mine && order.status === "OUT_FOR_DELIVERY" && (
        <div className="space-y-2">
          {order.paymentMethod === "COD" && (
            <input
              placeholder="Ask customer for 4-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={4}
              className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm"
            />
          )}
          <button
            onClick={() => updateStatus("DELIVERED")}
            disabled={loading || (order.paymentMethod === "COD" && otp.length !== 4)}
            className="w-full bg-canal text-husk text-sm font-semibold rounded-full py-2 disabled:opacity-50"
          >
            Mark delivered
          </button>
        </div>
      )}
    </div>
  );
}
