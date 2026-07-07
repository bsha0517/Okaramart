import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import DeliveryEtaBadge from "@/components/DeliveryEtaBadge";
import ValuePropStrip from "@/components/ValuePropStrip";
import CategoryCarousel from "@/components/CategoryCarousel";
import BannerStrip from "@/components/BannerStrip";
import CategoryProductRow from "@/components/CategoryProductRow";
import CollectionRow from "@/components/CollectionRow";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const ROW_SIZE = 10;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  // Old-style links (?category=slug) redirect to the real category page
  if (searchParams.category) {
    redirect(`/category/${searchParams.category}`);
  }

  const categories = await prisma.category.findMany();
  const query = searchParams.q?.trim();

  // Search view: flat grid
  if (query) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: "insensitive" },
      },
      take: 60,
    });

    return (
      <div className="max-w-6xl mx-auto px-4 py-5">
        <DeliveryEtaBadge />
        <CategoryCarousel categories={categories.filter((c) => !c.parentId)} />
        <h2 className="font-display text-xl text-char mb-3">Results for &quot;{query}&quot;</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
          {products.length === 0 && (
            <p className="col-span-full text-char/60">No products found. Try a different search.</p>
          )}
        </div>
      </div>
    );
  }

  const topLevelCategories = categories.filter((c) => !c.parentId);

  // Sections determine the layout, and a SINGLE_CATEGORY_ROW section might
  // pin a subcategory that isn't in topLevelCategories — so we need to know
  // the sections before building the batched product query below.
  const sections = await prisma.homeSection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const pinnedCategoryIds = sections
    .filter((s) => s.type === "SINGLE_CATEGORY_ROW" && s.refId)
    .map((s) => s.refId!);
  const neededCategoryIds = [...new Set([...topLevelCategories.map((c) => c.id), ...pinnedCategoryIds])];

  // Default homepage: admin-controlled section builder.
  // Everything fetched in parallel (Promise.all) rather than sequentially —
  // each round-trip costs more when the DB is in a different region than
  // the function, so batching matters even more here than usual.
  const [collections, allCategoryProducts] = await Promise.all([
    prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { items: { include: { product: true }, orderBy: { sortOrder: "asc" } } },
    }),
    // ONE query for every category's row instead of one query PER category.
    // Over-fetch a bit per category (ROW_SIZE * 3) then slice per-category
    // below, since Prisma can't easily do "top N per group" in one query.
    prisma.product.findMany({
      where: { isActive: true, categoryId: { in: neededCategoryIds } },
      orderBy: { updatedAt: "desc" },
      take: ROW_SIZE * neededCategoryIds.length * 3,
    }),
  ]);

  const productsByCategory = new Map<string, any[]>();
  for (const p of allCategoryProducts) {
    const list = productsByCategory.get(p.categoryId) ?? [];
    if (list.length < ROW_SIZE) list.push(p);
    productsByCategory.set(p.categoryId, list);
  }

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
              <CategoryProductRow
                key={c.id}
                products={productsByCategory.get(c.id) ?? []}
                categoryName={c.name}
                categorySlug={c.slug}
              />
            ));
          case "SINGLE_COLLECTION": {
            const collection = collections.find((c) => c.id === section.refId);
            return collection ? <CollectionRow key={section.id} collection={{ ...collection, title: section.title || collection.title }} /> : null;
          }
          case "SINGLE_CATEGORY_ROW": {
            const cat = categories.find((c) => c.id === section.refId);
            return cat ? (
              <CategoryProductRow
                key={section.id}
                products={productsByCategory.get(cat.id) ?? []}
                categoryName={section.title || cat.name}
                categorySlug={cat.slug}
              />
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
