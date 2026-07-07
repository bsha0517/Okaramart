import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/CategoryForm";
import CategoryRow from "@/components/CategoryRow";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } }, parent: true },
  });

  const topLevel = categories.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, typeof categories>();
  for (const c of categories) {
    if (c.parentId) {
      childrenByParent.set(c.parentId, [...(childrenByParent.get(c.parentId) ?? []), c]);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-2">Categories</h1>
      <p className="text-char/60 text-sm mb-6">
        Set a parent to make a category a subcategory — it'll appear nested under its
        parent on the storefront and in this list.
      </p>

      <div className="mb-8">
        <CategoryForm categories={topLevel} />
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
            {topLevel.map((c) => (
              <>
                <CategoryRow key={c.id} category={c} productCount={c._count.products} />
                {(childrenByParent.get(c.id) ?? []).map((child) => (
                  <CategoryRow key={child.id} category={child} productCount={child._count.products} indent />
                ))}
              </>
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
