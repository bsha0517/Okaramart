"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useCartStore } from "@/components/cartStore";

const MapLocationPicker = dynamic(() => import("@/components/MapLocationPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-56 rounded-lg bg-canal/5 animate-pulse" />,
});

type PaymentMethod = "JAZZCASH" | "EASYPAISA" | "COD";

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [address, setAddress] = useState({ addressLine: "", area: "" });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    setLoading(true);
    setError(null);
    try {
      // Saves/reuses an address for the logged-in customer (session cookie
      // is read server-side), then creates the order against it.
      const addressRes = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Delivery address", ...address, ...(coords ?? {}) }),
      });
      if (addressRes.status === 401) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }
      const addressData = await addressRes.json();
      if (!addressRes.ok) throw new Error(addressData.error || "Could not save address");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: addressData.id,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      if (data.payment.type === "redirect") {
        // Build a hidden form and auto-submit to the wallet's hosted page
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.payment.url;
        for (const [k, v] of Object.entries(data.payment.formFields || {})) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v as string;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } else {
        clear();
        window.location.href = `/orders/${data.orderId}`;
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-canal mb-6">Checkout</h1>

      <div className="mb-6 space-y-3">
        <input
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          placeholder="House / street address"
          value={address.addressLine}
          onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
        />
        <input
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          placeholder="Area in Okara (e.g. Model Town, Railway Colony)"
          value={address.area}
          onChange={(e) => setAddress({ ...address, area: e.target.value })}
        />
        <MapLocationPicker onChange={(loc) => setCoords(loc)} />
      </div>

      <h2 className="font-medium mb-3">Payment method</h2>
      <div className="space-y-2 mb-6">
        {[
          { id: "JAZZCASH", label: "JazzCash" },
          { id: "EASYPAISA", label: "EasyPaisa" },
          { id: "COD", label: "Cash on Delivery" },
        ].map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${
              method === opt.id ? "border-canal bg-canal/5" : "border-canal/15"
            }`}
          >
            <input
              type="radio"
              checked={method === opt.id}
              onChange={() => setMethod(opt.id as PaymentMethod)}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="flex justify-between font-medium text-lg mb-6">
        <span>Total</span>
        <span>Rs {subtotal.toFixed(0)} + delivery</span>
      </div>

      {error && <p className="text-brick text-sm mb-4">{error}</p>}

      {needsLogin && (
        <p className="text-sm bg-wheat/20 border border-wheat/40 rounded-lg px-3 py-2 mb-4">
          Please <a href="/signup" className="text-canal font-medium underline">log in or create an account</a> to place your order.
        </p>
      )}

      <button
        onClick={placeOrder}
        disabled={loading || items.length === 0}
        className="w-full bg-canal text-husk font-semibold rounded-full py-3 disabled:opacity-50"
      >
        {loading ? "Placing order…" : "Place order"}
      </button>
    </div>
  );
}
