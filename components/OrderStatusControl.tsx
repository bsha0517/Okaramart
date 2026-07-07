"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ALL_STATUSES = [
  "PLACED", "CONFIRMED", "PACKING", "PACKED",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED",
];
const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed", CONFIRMED: "Confirmed", PACKING: "Packing", PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled", RETURNED: "Returned",
};

export default function OrderStatusControl({
  orderId,
  currentStatus,
  paymentMethod,
}: {
  orderId: string;
  currentStatus: string;
  paymentMethod: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [otp, setOtp] = useState("");
  const [cashCollected, setCashCollected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsOtp = status === "DELIVERED" && paymentMethod === "COD";

  async function handleUpdate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: note || undefined,
        otp: needsOtp ? otp : undefined,
        cashCollected: needsOtp ? cashCollected : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Could not update status"); return; }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              status === s ? "bg-canal text-husk border-canal" : "border-canal/20 text-char/70"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {needsOtp && (
        <>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="4-digit delivery OTP from customer"
            maxLength={4}
            className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-char/70">
            <input type="checkbox" checked={cashCollected} onChange={(e) => setCashCollected(e.target.checked)} />
            Cash has been collected from the customer
          </label>
        </>
      )}

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm"
      />

      {error && <p className="text-brick text-sm">{error}</p>}

      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus || (needsOtp && (otp.length !== 4 || !cashCollected))}
        className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50"
      >
        {loading ? "Updating…" : "Update status"}
      </button>
    </div>
  );
}
