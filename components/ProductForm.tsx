"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  brand: string;
  price: string;
  compareAtPrice: string;
  unit: string;
  sku: string;
  stockQty: string;
  lowStockAlertAt: string;
  categoryId: string;
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  brand: "",
  price: "",
  compareAtPrice: "",
  unit: "",
  sku: "",
  stockQty: "0",
  lowStockAlertAt: "5",
  categoryId: "",
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Partial<ProductFormValues> & { images?: string[]; attributes?: Record<string, string> };
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>(
    initial?.attributes ? Object.entries(initial.attributes).map(([key, value]) => ({ key, value })) : []
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(values.id);

  function update<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((v) => {
      const next = { ...v, [key]: val };
      // Auto-generate slug from name unless the user has edited it manually while editing
      if (key === "name" && !isEdit) next.slug = slugify(val as string);
      return next;
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      update("imageUrl", data.url);
    } catch (err: any) {
      setError(`Image upload: ${err.message} — you can paste an image URL below instead.`);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImages((imgs) => [...imgs, data.url]);
    } catch (err: any) {
      setError(`Image upload: ${err.message} — you can paste an image URL below instead.`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
      images: images.filter((i) => i.trim() !== ""),
      brand: values.brand || undefined,
      attributes: attributes.length > 0
        ? Object.fromEntries(attributes.filter((a) => a.key.trim()).map((a) => [a.key, a.value]))
        : undefined,
      price: parseFloat(values.price),
      compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : null,
      unit: values.unit,
      sku: values.sku,
      stockQty: parseInt(values.stockQty || "0", 10),
      lowStockAlertAt: parseInt(values.lowStockAlertAt || "5", 10),
      categoryId: values.categoryId,
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${values.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Save failed");

      router.push("/admin/inventory");
      router.refresh();
    } catch (err: any) {
      setError(typeof err.message === "string" ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!values.id) return;
    if (!confirm("Remove this product from the storefront? Order history is kept.")) return;
    await fetch(`/api/products/${values.id}`, { method: "DELETE" });
    router.push("/admin/inventory");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && <p className="text-brick text-sm bg-brick/5 border border-brick/20 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Product name</label>
        <input
          required
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">URL slug</label>
          <input
            required
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.slug}
            onChange={(e) => update("slug", slugify(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            required
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.sku}
            onChange={(e) => update("sku", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            required
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand (optional)</label>
          <input
            placeholder="e.g. Nestlé, Local"
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.brand}
            onChange={(e) => update("brand", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price (Rs)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Compare-at price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Optional"
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.compareAtPrice}
            onChange={(e) => update("compareAtPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <input
            required
            placeholder="1 kg, 500 ml…"
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.unit}
            onChange={(e) => update("unit", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stock quantity</label>
          <input
            required
            type="number"
            min="0"
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.stockQty}
            onChange={(e) => update("stockQty", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Low-stock alert at</label>
          <input
            type="number"
            min="0"
            className="w-full border border-canal/20 rounded-lg px-3 py-2"
            value={values.lowStockAlertAt}
            onChange={(e) => update("lowStockAlertAt", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Product photo</label>
        <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm mb-2" />
        <input
          placeholder="Or paste an image URL — https://…"
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          value={values.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
        />
        {values.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={values.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg mt-2 border border-canal/10" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Additional photos (gallery)</label>
        <input type="file" accept="image/*" onChange={handleGalleryUpload} className="text-sm mb-2" />
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Gallery ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-canal/10" />
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 bg-brick text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-char/50">Shown as a thumbnail strip on the product page. The main photo above is always included automatically.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Highlights (shown as a details table on the product page)</label>
        <div className="space-y-2">
          {attributes.map((attr, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Label — e.g. Material"
                value={attr.key}
                onChange={(e) => setAttributes((a) => a.map((x, idx) => idx === i ? { ...x, key: e.target.value } : x))}
                className="flex-1 border border-canal/20 rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Value — e.g. Plastic"
                value={attr.value}
                onChange={(e) => setAttributes((a) => a.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                className="flex-1 border border-canal/20 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setAttributes((a) => a.filter((_, idx) => idx !== i))}
                className="text-brick text-sm px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAttributes((a) => [...a, { key: "", value: "" }])}
          className="text-canal text-sm font-medium mt-2"
        >
          + Add highlight
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          rows={3}
          className="w-full border border-canal/20 rounded-lg px-3 py-2"
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-canal text-husk font-semibold rounded-full px-6 py-2.5 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDeactivate}
            className="text-brick text-sm font-medium"
          >
            Remove from storefront
          </button>
        )}
      </div>
    </form>
  );
}
