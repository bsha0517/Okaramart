"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryRow({ category, productCount }: { category: any; productCount: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm(`Delete "${category.name}"?`)) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  }

  return (
    <tr className="border-t border-canal/5">
      <td className="px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-husk border border-canal/10 overflow-hidden flex items-center justify-center text-canal font-semibold text-sm">
          {category.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            category.name.charAt(0)
          )}
        </div>
      </td>
      <td className="px-4 py-3 font-medium">{category.name}</td>
      <td className="px-4 py-3 text-char/50">{category.slug}</td>
      <td className="px-4 py-3">{productCount}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={remove} disabled={loading} className="text-brick text-xs font-medium">Delete</button>
        {error && <p className="text-brick text-xs mt-1">{error}</p>}
      </td>
    </tr>
  );
}
