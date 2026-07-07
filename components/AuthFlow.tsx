"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthFlow({ initialMode = "SIGNUP" }: { initialMode?: "SIGNUP" | "LOGIN" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"SIGNUP" | "LOGIN">(initialMode);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^03\d{9}$/.test(phone)) {
      setError("Enter a valid number, e.g. 03001234567");
      return;
    }
    if (mode === "SIGNUP" && !name.trim()) {
      setError("Enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "SIGNUP" ? "/api/auth/password/signup" : "/api/auth/password/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "SIGNUP"
            ? { name, phone, email: email || undefined, password }
            : { phone, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      // If they picked a delivery location before logging in, save it now
      const pending = localStorage.getItem("okaramart_pending_location");
      if (pending) {
        try {
          const loc = JSON.parse(pending);
          await fetch("/api/addresses/default", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: "Current location",
              addressLine: loc.formattedAddress || "Pinned location",
              area: loc.formattedAddress?.split(",")[0] || "Okara",
              lat: loc.lat,
              lng: loc.lng,
            }),
          });
        } catch {
          // best-effort — don't block login if this fails
        }
        localStorage.removeItem("okaramart_pending_location");
      }

      router.push("/");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-3xl text-canal mb-1">
        {mode === "SIGNUP" ? "Create your account" : "Log in"}
      </h1>
      <p className="text-char/60 text-sm mb-6">
        {mode === "SIGNUP"
          ? "Just your phone number and a password — no verification code needed."
          : "Enter your phone number and password."}
      </p>

      {error && <p className="text-brick text-sm bg-brick/5 border border-brick/20 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "SIGNUP" && (
          <>
            <input
              className="w-full border border-canal/20 rounded-lg px-3 py-2"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              className="w-full border border-canal/20 rounded-lg px-3 py-2"
              placeholder="Email address (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        )}
        <input
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          placeholder="03XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          maxLength={11}
        />
        <input
          type="password"
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          placeholder={mode === "SIGNUP" ? "Create a password (min. 6 characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-canal text-husk font-semibold rounded-full py-3 disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "SIGNUP" ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-char/60 mt-6">
        {mode === "SIGNUP" ? "Already have an account?" : "New to Okara Mart?"}{" "}
        <button
          className="text-canal font-medium"
          onClick={() => { setMode(mode === "SIGNUP" ? "LOGIN" : "SIGNUP"); setError(null); setPassword(""); }}
        >
          {mode === "SIGNUP" ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
