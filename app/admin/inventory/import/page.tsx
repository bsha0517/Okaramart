"use client";

import { useState } from "react";

const SAMPLE_CSV = `name,sku,price,stockQty,unit,category,imageUrl
Fresh Milk 1L,MLK-1L,220,50,1 litre,dairy-eggs,
White Bread,BRD-WHT,130,30,1 loaf,bakery,`;

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const csv = await file.text();
      const res = await fetch("/api/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "okara-mart-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-canal mb-2">Bulk import products</h1>
      <p className="text-char/60 text-sm mb-6">
        Upload a CSV with columns: <code className="bg-canal/5 px-1 rounded">name, sku, price, stockQty, unit, category, imageUrl</code>.
        Matching by SKU updates existing products; new SKUs create new products.
        The category column should match an existing category's name or slug.
      </p>

      <button onClick={downloadSample} className="text-canal text-sm font-medium mb-6 underline">
        Download sample CSV
      </button>

      <div className="border-2 border-dashed border-canal/20 rounded-xl p-6 text-center mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>

      {error && <p className="text-brick text-sm bg-brick/5 border border-brick/20 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="bg-canal text-husk font-semibold rounded-full px-6 py-2.5 disabled:opacity-50"
      >
        {loading ? "Importing…" : "Import CSV"}
      </button>

      {result && (
        <div className="mt-6 bg-white border border-canal/10 rounded-xl p-4 text-sm">
          <p className="font-medium mb-2">
            {result.created} created, {result.updated} updated, {result.errors.length} errors
          </p>
          {result.errors.length > 0 && (
            <ul className="text-brick space-y-1">
              {result.errors.map((e: any, i: number) => (
                <li key={i}>Row {e.row}: {e.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
