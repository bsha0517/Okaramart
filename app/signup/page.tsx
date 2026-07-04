"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "phone" | "otp";

export default function SignupPage({ initialMode = "SIGNUP" }: { initialMode?: "SIGNUP" | "LOGIN" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"SIGNUP" | "LOGIN">(initialMode);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function startCooldown(seconds: number) {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function requestOtp() {
    setError(null);
    if (!/^03\d{9}$/.test(phone)) {
      setError("Enter a valid number, e.g. 03001234567");
      return;
    }
    if (mode === "SIGNUP" && !name.trim()) {
      setError("Enter your name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setStep("otp");
      startCooldown(60);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, purpose: mode, name: mode === "SIGNUP" ? name : undefined, email: mode === "SIGNUP" && email ? email : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
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
        {step === "phone"
          ? "We'll text you a code to verify your number."
          : `Enter the 4-digit code sent to ${phone}.`}
      </p>

      {error && <p className="text-brick text-sm bg-brick/5 border border-brick/20 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {step === "phone" ? (
        <div className="space-y-3">
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
          <button
            onClick={requestOtp}
            disabled={loading}
            className="w-full bg-canal text-husk font-semibold rounded-full py-3 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            className="w-full border border-canal/20 rounded-lg px-3 py-2 text-center text-2xl tracking-[0.5em]"
            placeholder="0000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            maxLength={4}
          />
          <button
            onClick={verifyOtp}
            disabled={loading || code.length !== 4}
            className="w-full bg-canal text-husk font-semibold rounded-full py-3 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </button>
          <button
            onClick={requestOtp}
            disabled={cooldown > 0}
            className="w-full text-sm text-canal disabled:text-char/30"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      )}

      <p className="text-center text-sm text-char/60 mt-6">
        {mode === "SIGNUP" ? "Already have an account?" : "New to Okara Mart?"}{" "}
        <button
          className="text-canal font-medium"
          onClick={() => { setMode(mode === "SIGNUP" ? "LOGIN" : "SIGNUP"); setStep("phone"); setError(null); }}
        >
          {mode === "SIGNUP" ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
