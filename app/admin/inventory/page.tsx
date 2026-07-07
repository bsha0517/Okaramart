import { prisma } from "@/lib/prisma";
import RemoveMockProductsButton from "@/components/RemoveMockProductsButton";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, mockCount] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.count({ where: { sku: { startsWith: "MOCK-" } } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-canal">Inventory</h1>
        <div className="flex gap-2">
          <a
            href="/admin/inventory/import"
            className="border border-canal text-canal font-semibold rounded-full px-5 py-2 text-sm"
          >
            Bulk import CSV
          </a>
          <a
            href="/admin/inventory/new"
            className="bg-canal text-husk font-semibold rounded-full px-5 py-2 text-sm"
          >
            + Add product
          </a>
        </div>
      </div>

      <RemoveMockProductsButton mockCount={mockCount} />

      <div className="bg-white rounded-xl border border-canal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-husk text-left text-char/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-canal/5">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-char/60">{p.category.name}</td>
                <td className="px-4 py-3">Rs {Number(p.price).toFixed(0)}</td>
                <td className={`px-4 py-3 ${p.stockQty <= p.lowStockAlertAt ? "text-brick font-medium" : ""}`}>
                  {p.stockQty}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-canal/10 text-canal" : "bg-char/10 text-char/50"}`}>
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <a href={`/admin/inventory/${p.id}`} className="text-canal font-medium">Edit</a>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-char/40">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
