"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CollectionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug: slugify(title), sortOrder: parseInt(sortOrder, 10) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Failed to create row");
      setTitle(""); setSortOrder("0");
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
        <label className="block text-xs font-medium mb-1">Row title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Trending Now" className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-56" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Position on homepage</label>
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-20" />
      </div>
      <button type="submit" disabled={saving} className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50">
        {saving ? "Adding…" : "Add row"}
      </button>
      {error && <p className="text-brick text-xs w-full">{error}</p>}
    </form>
  );
}
