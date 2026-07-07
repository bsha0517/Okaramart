"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AuthFlow({ initialMode = "SIGNUP" }: { initialMode?: "SIGNUP" | "LOGIN" }) {
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

      // Hard reload (not router.push) guarantees the fresh session cookie
      // is sent on the next request — avoids needing to sign in twice.
      window.location.href = "/";
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

      <div className="space-y-2 mb-5">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 border border-canal/20 rounded-full py-2.5 font-medium text-sm hover:bg-canal/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.05H2.18a11 11 0 000 9.9l3.66-2.85z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.05l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </button>
        <button
          onClick={() => signIn("facebook", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 border border-canal/20 rounded-full py-2.5 font-medium text-sm hover:bg-canal/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/>
          </svg>
          Continue with Facebook
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-canal/10" />
        <span className="text-xs text-char/40">or</span>
        <div className="flex-1 h-px bg-canal/10" />
      </div>

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
