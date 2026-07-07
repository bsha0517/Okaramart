import ProductCard from "./ProductCard";

/**
 * Purely presentational now — takes pre-fetched products instead of
 * querying the database itself. Querying per-row used to mean one DB
 * round-trip per category on the homepage (N+1), which is expensive
 * even locally and painful across regions. The homepage now does ONE
 * batched query for all categories and passes the relevant slice here.
 */
export default function CategoryProductRow({
  products,
  categoryName,
  categorySlug,
}: {
  products: any[];
  categoryName: string;
  categorySlug: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl text-char">{categoryName}</h2>
        <a href={`/category/${categorySlug}`} className="text-canal text-sm font-semibold flex items-center gap-1">
          See All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {products.map((p) => (
          <div key={p.id} className="shrink-0 w-36 sm:w-40">
            <ProductCard product={p} categorySlug={categorySlug} />
          </div>
        ))}
      </div>
    </section>
  );
}
