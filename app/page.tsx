import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import DeliveryEtaBadge from "@/components/DeliveryEtaBadge";
import ValuePropStrip from "@/components/ValuePropStrip";
import CategoryCarousel from "@/components/CategoryCarousel";
import BannerStrip from "@/components/BannerStrip";
import CategoryProductRow from "@/components/CategoryProductRow";
import CollectionRow from "@/components/CollectionRow";

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

    // Subcategory chips if this category has children
    const subcategories = categories.filter((c) => c.parentId === activeCategory?.id);

    return (
      <div className="max-w-6xl mx-auto px-4 py-5">
        <DeliveryEtaBadge />
        <CategoryCarousel categories={categories.filter((c) => !c.parentId)} />

        {subcategories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {subcategories.map((sc) => (
              <a key={sc.id} href={`/?category=${sc.slug}`}
                className="text-sm border border-canal/20 rounded-full px-3 py-1 text-canal hover:bg-canal/5">
                {sc.name}
              </a>
            ))}
          </div>
        )}

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

  // Default homepage: admin-controlled section builder
  const sections = await prisma.homeSection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const [collections, topLevelCategories] = await Promise.all([
    prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { items: { include: { product: true }, orderBy: { sortOrder: "asc" } } },
    }),
    categories.filter((c) => !c.parentId),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <DeliveryEtaBadge />

      {sections.map((section) => {
        switch (section.type) {
          case "VALUE_PROPS":
            return <ValuePropStrip key={section.id} />;
          case "CATEGORY_CAROUSEL":
            return <CategoryCarousel key={section.id} categories={topLevelCategories} />;
          case "BANNERS":
            return <BannerStrip key={section.id} />;
          case "ALL_COLLECTIONS":
            return collections.map((c) => <CollectionRow key={c.id} collection={c} />);
          case "ALL_CATEGORY_ROWS":
            return topLevelCategories.map((c) => (
              <CategoryProductRow key={c.id} categoryId={c.id} categoryName={c.name} categorySlug={c.slug} />
            ));
          case "SINGLE_COLLECTION": {
            const collection = collections.find((c) => c.id === section.refId);
            return collection ? <CollectionRow key={section.id} collection={{ ...collection, title: section.title || collection.title }} /> : null;
          }
          case "SINGLE_CATEGORY_ROW": {
            const cat = categories.find((c) => c.id === section.refId);
            return cat ? (
              <CategoryProductRow key={section.id} categoryId={cat.id} categoryName={section.title || cat.name} categorySlug={cat.slug} />
            ) : null;
          }
          default:
            return null;
        }
      })}

      {sections.length === 0 && (
        <p className="text-char/40 text-sm">
          Homepage has no sections configured yet — set them up in /admin/homepage.
        </p>
      )}
    </div>
  );
}
