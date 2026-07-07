import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/CategoryForm";
import CategoryRow from "@/components/CategoryRow";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Categories</h1>

      <div className="mb-8">
        <CategoryForm />
      </div>

      <div className="bg-white rounded-xl border border-canal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-husk text-left text-char/60">
            <tr>
              <th className="px-4 py-3">Icon</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} productCount={c._count.products} />
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-char/40">No categories yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
