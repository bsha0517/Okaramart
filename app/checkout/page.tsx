"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useCartStore } from "@/components/cartStore";

const MapLocationPicker = dynamic(() => import("@/components/GoogleMapLocationPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-56 rounded-lg bg-canal/5 animate-pulse" />,
});

type PaymentMethod = "JAZZCASH" | "EASYPAISA" | "COD";

/** Safety net: if an API ever returns an error as an object instead of a
 * string, this pulls out something readable instead of "[object Object]". */
function readableError(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const anyErr = err as any;
    if (anyErr.formErrors?.[0]) return anyErr.formErrors[0];
    const firstFieldError = Object.values(anyErr.fieldErrors ?? {})[0];
    if (Array.isArray(firstFieldError) && firstFieldError[0]) return firstFieldError[0];
  }
  return fallback;
}

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [address, setAddress] = useState({ addressLine: "", area: "" });
  const [payerPhone, setPayerPhone] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number; formattedAddress?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    setLoading(true);
    setError(null);

    if (address.addressLine.trim().length < 3) {
      setError("Please enter a house/street address (at least 3 characters)");
      setLoading(false);
      return;
    }
    if (address.area.trim().length < 2) {
      setError("Please enter your area in Okara (e.g. Model Town)");
      setLoading(false);
      return;
    }

    try {
      // Saves/reuses an address for the logged-in customer (session cookie
      // is read server-side), then creates the order against it.
      const addressRes = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: "Delivery address",
          ...address,
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        }),
      });
      if (addressRes.status === 401) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }
      const addressData = await addressRes.json();
      if (!addressRes.ok) throw new Error(readableError(addressData.error, "Could not save address"));

      if ((method === "JAZZCASH" || method === "EASYPAISA") && !/^03\d{9}$/.test(payerPhone)) {
        setError("Enter a valid mobile number for JazzCash/EasyPaisa, e.g. 03001234567");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: addressData.id,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod: method,
          payerPhone: payerPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(readableError(data.error, "Order failed"));

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
          required
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          placeholder="House / street address"
          value={address.addressLine}
          onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
        />
        <input
          required
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          placeholder="Area in Okara (e.g. Model Town, Railway Colony) — required"
          value={address.area}
          onChange={(e) => setAddress({ ...address, area: e.target.value })}
        />
        <MapLocationPicker
          onChange={(loc) => {
            setCoords(loc);
            if (loc.formattedAddress && !address.addressLine) {
              setAddress((a) => ({ ...a, addressLine: loc.formattedAddress! }));
            }
          }}
        />
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

      {(method === "JAZZCASH" || method === "EASYPAISA") && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Mobile number for {method === "JAZZCASH" ? "JazzCash" : "EasyPaisa"}</label>
          <input
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            placeholder="03XXXXXXXXX"
            value={payerPhone}
            onChange={(e) => setPayerPhone(e.target.value.replace(/\D/g, ""))}
            maxLength={11}
          />
        </div>
      )}

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
