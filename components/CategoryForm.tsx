"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CategoryForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug: slugify(name), imageUrl: imageUrl || undefined,
          parentId: parentId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Failed to add category");
      setName(""); setImageUrl(""); setParentId("");
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
          placeholder="e.g. Frozen Food" className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Parent category (optional)</label>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm">
          <option value="">None — top-level category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Icon image URL (optional)</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…" className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-56" />
      </div>
      <button type="submit" disabled={saving} className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50">
        {saving ? "Adding…" : "Add category"}
      </button>
      {error && <p className="text-brick text-xs w-full">{error}</p>}
    </form>
  );
}
