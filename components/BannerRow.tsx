"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BannerRow({ banner }: { banner: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    await fetch(`/api/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this banner?")) return;
    setLoading(true);
    await fetch(`/api/banners/${banner.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white border border-canal/10 rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: banner.bgColor, backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined, backgroundSize: "cover" }}
        />
        <div>
          <p className="font-medium text-sm">{banner.title}</p>
          <p className="text-xs text-char/50">{banner.subtitle || banner.linkUrl || "—"} · order {banner.sortOrder}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleActive} disabled={loading}
          className={`px-2 py-1 rounded-full text-xs font-medium ${banner.isActive ? "bg-canal/10 text-canal" : "bg-char/10 text-char/50"}`}>
          {banner.isActive ? "Active" : "Hidden"}
        </button>
        <button onClick={remove} disabled={loading} className="text-brick text-xs font-medium">Delete</button>
      </div>
    </div>
  );
}
