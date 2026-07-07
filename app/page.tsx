import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import DeliveryEtaBadge from "@/components/DeliveryEtaBadge";
import ValuePropStrip from "@/components/ValuePropStrip";
import CategoryCarousel from "@/components/CategoryCarousel";
import BannerStrip from "@/components/BannerStrip";
import CategoryProductRow from "@/components/CategoryProductRow";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const categories = await prisma.category.findMany();
  const activeCategorySlug = searchParams.category;
  const query = searchParams.q?.trim();

  // Search or category-filter view: flat grid, no homepage sections
  if (query || activeCategorySlug) {
    const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(activeCategorySlug ? { category: { slug: activeCategorySlug } } : {}),
        ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
      },
      take: 60,
    });

    return (
      <div className="max-w-6xl mx-auto px-4 py-5">
        <DeliveryEtaBadge />
        <CategoryCarousel categories={categories} />
        <h2 className="font-display text-xl text-char mb-3">
          {query ? `Results for "${query}"` : activeCategory?.name}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
          {products.length === 0 && (
            <p className="col-span-full text-char/60">No products found. Try a different search or category.</p>
          )}
        </div>
      </div>
    );
  }

  // Default homepage: full quick-commerce layout
  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <DeliveryEtaBadge />
      <ValuePropStrip />
      <CategoryCarousel categories={categories} />
      <BannerStrip />

      {categories.map((c) => (
        <CategoryProductRow key={c.id} categoryId={c.id} categoryName={c.name} categorySlug={c.slug} />
      ))}
    </div>
  );
}
