"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdateEmailForm({ currentEmail }: { currentEmail: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(currentEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/account/update-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-canal text-sm font-medium">
        {currentEmail ? "Change email" : "Add an email address"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="border border-canal/20 rounded-lg px-3 py-1.5 text-sm"
      />
      <button onClick={handleSave} disabled={saving} className="bg-canal text-husk text-sm font-medium rounded-full px-3 py-1.5 disabled:opacity-50">
        {saving ? "Saving…" : "Save"}
      </button>
      <button onClick={() => { setEditing(false); setError(null); }} className="text-char/50 text-sm">Cancel</button>
      {error && <p className="text-brick text-xs">{error}</p>}
    </div>
  );
}
