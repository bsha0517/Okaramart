"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PACKER");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Failed to add team member");
      setName(""); setPhone(""); setPassword("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-canal/10 rounded-xl p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Phone</label>
        <input required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          maxLength={11} placeholder="03XXXXXXXXX"
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-36" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Temporary password</label>
        <input required type="text" value={password} onChange={(e) => setPassword(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm">
          <option value="MANAGER">Manager</option>
          <option value="PACKER">Packer</option>
          <option value="RIDER">Rider</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>
      <button type="submit" disabled={saving} className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50">
        {saving ? "Adding…" : "Add team member"}
      </button>
      {error && <p className="text-brick text-xs w-full">{error}</p>}
    </form>
  );
}
