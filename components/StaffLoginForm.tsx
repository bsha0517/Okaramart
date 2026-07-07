"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect phone number or password.");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") || "/admin";
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-3xl text-canal mb-1">Staff login</h1>
      <p className="text-char/60 text-sm mb-6">
        For Okara Mart team members — admins, managers, packers, and riders.
      </p>

      {error && <p className="text-brick text-sm bg-brick/5 border border-brick/20 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-canal text-husk font-semibold rounded-full py-3 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-char/50 mt-6">
        Shopping instead? <a href="/login" className="text-canal font-medium">Customer login</a>
      </p>
    </div>
  );
}
