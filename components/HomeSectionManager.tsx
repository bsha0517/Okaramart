"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  VALUE_PROPS: "Value-prop badges (COD, JazzCash, etc.)",
  CATEGORY_CAROUSEL: "Category icon carousel",
  BANNERS: "Promo banner strip",
  ALL_COLLECTIONS: "All curated carousel rows (auto)",
  ALL_CATEGORY_ROWS: "All per-category product rows (auto)",
  SINGLE_COLLECTION: "One specific carousel row",
  SINGLE_CATEGORY_ROW: "One specific category row",
};

export default function HomeSectionManager({
  sections,
  collections,
  categories,
}: {
  sections: any[];
  collections: { id: string; title: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [newType, setNewType] = useState("SINGLE_COLLECTION");
  const [newRefId, setNewRefId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/home-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          refId: newRefId || undefined,
          title: newTitle || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add section");
      setNewRefId(""); setNewTitle("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/home-sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this section from the homepage?")) return;
    await fetch(`/api/home-sections/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function move(index: number, direction: -1 | 1) {
    const other = sections[index + direction];
    const current = sections[index];
    if (!other) return;
    await Promise.all([
      fetch(`/api/home-sections/${current.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      fetch(`/api/home-sections/${other.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: current.sortOrder }),
      }),
    ]);
    router.refresh();
  }

  function refLabel(section: any) {
    if (section.type === "SINGLE_COLLECTION") {
      return collections.find((c) => c.id === section.refId)?.title ?? "Unknown collection";
    }
    if (section.type === "SINGLE_CATEGORY_ROW") {
      return categories.find((c) => c.id === section.refId)?.name ?? "Unknown category";
    }
    return null;
  }

  return (
    <div className="max-w-2xl">
      <div className="space-y-2 mb-8">
        {sections.map((s, i) => (
          <div key={s.id} className="bg-white border border-canal/10 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{s.title || TYPE_LABELS[s.type] || s.type}</p>
              <p className="text-xs text-char/50">
                {TYPE_LABELS[s.type]}{refLabel(s) ? ` — ${refLabel(s)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-canal disabled:opacity-20 px-1">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-canal disabled:opacity-20 px-1">↓</button>
              <button
                onClick={() => toggle(s.id, s.isActive)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? "bg-canal/10 text-canal" : "bg-char/10 text-char/50"}`}
              >
                {s.isActive ? "Visible" : "Hidden"}
              </button>
              <button onClick={() => remove(s.id)} className="text-brick text-xs font-medium">Remove</button>
            </div>
          </div>
        ))}
        {sections.length === 0 && <p className="text-char/40 text-sm">No sections yet — the homepage will be empty. Add one below.</p>}
      </div>

      <form onSubmit={addSection} className="bg-white border border-canal/10 rounded-xl p-4 space-y-3">
        <h2 className="font-medium text-sm">Add a section</h2>
        <select value={newType} onChange={(e) => { setNewType(e.target.value); setNewRefId(""); }}
          className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <option key={type} value={type}>{label}</option>
          ))}
        </select>

        {newType === "SINGLE_COLLECTION" && (
          <select value={newRefId} onChange={(e) => setNewRefId(e.target.value)}
            className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm">
            <option value="">Select a carousel row…</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        )}
        {newType === "SINGLE_CATEGORY_ROW" && (
          <select value={newRefId} onChange={(e) => setNewRefId(e.target.value)}
            className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm">
            <option value="">Select a category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Override display title (optional)"
          className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm"
        />

        <button type="submit" disabled={saving} className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50">
          {saving ? "Adding…" : "Add section"}
        </button>
        {error && <p className="text-brick text-xs">{error}</p>}
      </form>
    </div>
  );
}
