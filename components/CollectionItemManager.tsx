"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CollectionItemManager({
  collectionId,
  items,
  allProducts,
}: {
  collectionId: string;
  items: { id: string; product: any }[];
  allProducts: any[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const inCollectionIds = new Set(items.map((i) => i.product.id));
  const filtered = query
    ? allProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  async function addProduct(productId: string) {
    setLoading(productId);
    await fetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setLoading(null);
    setQuery("");
    router.refresh();
  }

  async function removeItem(itemId: string) {
    setLoading(itemId);
    await fetch(`/api/collections/${collectionId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6 relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products to add…"
          className="w-full border border-canal/20 rounded-lg px-3 py-2 text-sm"
        />
        {filtered.length > 0 && (
          <div className="absolute z-10 bg-white border border-canal/10 rounded-lg mt-1 w-full max-h-64 overflow-y-auto shadow-lg">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addProduct(p.id)}
                disabled={inCollectionIds.has(p.id) || loading === p.id}
                className="w-full text-left px-3 py-2 text-sm hover:bg-canal/5 flex justify-between disabled:opacity-40"
              >
                <span>{p.name}</span>
                {inCollectionIds.has(p.id) && <span className="text-char/40">Already added</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white border border-canal/10 rounded-lg p-3">
            <span className="text-sm font-medium">{item.product.name}</span>
            <button
              onClick={() => removeItem(item.id)}
              disabled={loading === item.id}
              className="text-brick text-xs font-medium"
            >
              Remove
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-char/40 text-sm">No products in this row yet — search above to add some.</p>}
      </div>
    </div>
  );
}
