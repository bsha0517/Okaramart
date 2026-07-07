import ProductCard from "./ProductCard";

export default function CollectionRow({ collection }: { collection: any }) {
  const products = collection.items.map((i: any) => i.product).filter((p: any) => p.isActive);
  if (products.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="font-display text-xl text-char mb-3">{collection.title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {products.map((p: any) => (
          <div key={p.id} className="shrink-0 w-36 sm:w-40">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
