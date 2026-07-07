"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BannerForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [bgColor, setBgColor] = useState("#0F3D3E");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, subtitle: subtitle || undefined, imageUrl: imageUrl || undefined,
          linkUrl: linkUrl || undefined, bgColor, sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Failed to add banner");
      setTitle(""); setSubtitle(""); setImageUrl(""); setLinkUrl(""); setSortOrder("0");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-canal/10 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="Title (e.g. Weekend Fresh Picks)" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Subtitle (optional)" value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Image URL (optional)" value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Link — e.g. /?category=snacks" value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="border border-canal/20 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Background color</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
            className="border border-canal/20 rounded-lg h-9 w-16" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            className="border border-canal/20 rounded-lg px-3 py-2 text-sm w-20" />
        </div>
        <button type="submit" disabled={saving} className="bg-canal text-husk text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-50">
          {saving ? "Adding…" : "Add banner"}
        </button>
      </div>
      {error && <p className="text-brick text-xs">{error}</p>}
    </form>
  );
}
