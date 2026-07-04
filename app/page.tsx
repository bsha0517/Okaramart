import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 24,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-canal mb-2">
          Delivered to your door in Okara.
        </h1>
        <p className="text-char/70 max-w-xl">
          Groceries, dairy, and daily essentials — packed at our Okara dark store, on your
          doorstep in minutes.
        </p>
      </section>

      <section className="mb-8 flex gap-3 overflow-x-auto pb-2">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/?category=${c.slug}`}
            className="shrink-0 rounded-full border border-canal/20 px-4 py-2 text-sm font-medium text-canal hover:bg-canal hover:text-husk transition-colors"
          >
            {c.name}
          </a>
        ))}
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-char/60">
            No products yet — add some from the admin panel at /admin/inventory.
          </p>
        )}
      </section>
    </div>
  );
}
