import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import DeliveryEtaBadge from "@/components/DeliveryEtaBadge";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await prisma.category.findMany();
  const activeCategorySlug = searchParams.category;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(activeCategorySlug ? { category: { slug: activeCategorySlug } } : {}),
    },
    include: { category: true },
    take: 60,
  });

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      {/* Top delivery-time badge — the "10-minute delivery" promise that
          anchors quick-commerce apps like Zepto/Blinkit/Instamart */}
      <DeliveryEtaBadge />

      <section className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-char mb-1">
          Groceries delivered fast, only in Okara
        </h1>
        <p className="text-char/60 text-sm max-w-xl">
          Packed at our Okara dark store, on your doorstep in minutes.
        </p>
      </section>

      {/* Category icon grid — tap a tile to filter the product grid below,
          same pattern as Zepto's home screen category tiles */}
      <section className="mb-8">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          <a
            href="/"
            className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors ${
              !activeCategorySlug ? "bg-canal/10" : "hover:bg-canal/5"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-wheat/30 flex items-center justify-center text-xl">
              🛒
            </div>
            <span className="text-xs font-medium text-char text-center">All</span>
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/?category=${c.slug}`}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors ${
                activeCategorySlug === c.slug ? "bg-canal/10" : "hover:bg-canal/5"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-husk border border-canal/10 overflow-hidden flex items-center justify-center text-canal font-display font-semibold text-lg">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  c.name.charAt(0)
                )}
              </div>
              <span className="text-xs font-medium text-char text-center leading-tight">{c.name}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-char mb-3">
          {activeCategory ? activeCategory.name : "All products"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-char/60">
              No products here yet — add some from the admin panel at /admin/inventory.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
