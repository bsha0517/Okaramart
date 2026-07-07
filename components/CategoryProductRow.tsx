import { prisma } from "@/lib/prisma";
import ProductCard from "./ProductCard";

export default async function CategoryProductRow({
  categoryId,
  categoryName,
  categorySlug,
}: {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
}) {
  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl text-char">{categoryName}</h2>
        <a href={`/?category=${categorySlug}`} className="text-canal text-sm font-semibold flex items-center gap-1">
          See All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {products.map((p) => (
          <div key={p.id} className="shrink-0 w-36 sm:w-40">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
