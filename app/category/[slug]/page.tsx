import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategoryIcon } from "@/lib/categoryIcons";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { parent: true, children: true },
  });

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb — this is the fix: category links now go to a real
          page instead of back to "/" */}
      <nav className="text-sm text-char/50 mb-4 flex items-center gap-1.5">
        <a href="/" className="hover:text-canal">Home</a>
        {category.parent && (
          <>
            <span>/</span>
            <a href={`/category/${category.parent.slug}`} className="hover:text-canal">{category.parent.name}</a>
          </>
        )}
        <span>/</span>
        <span className="text-char">{category.name}</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-wheat/15 border border-canal/10 flex items-center justify-center overflow-hidden">
          {category.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{getCategoryIcon(category.slug)}</span>
          )}
        </div>
        <h1 className="font-display text-2xl md:text-3xl text-char">{category.name}</h1>
      </div>

      {category.children.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {category.children.map((sub) => (
            <a key={sub.id} href={`/category/${sub.slug}`}
              className="text-sm border border-canal/20 rounded-full px-3 py-1.5 text-canal hover:bg-canal/5 flex items-center gap-1.5">
              <span>{getCategoryIcon(sub.slug)}</span>
              {sub.name}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} categorySlug={category.slug} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-char/60">
            No products in {category.name} yet — add some from the admin panel.
          </p>
        )}
      </div>
    </div>
  );
}
