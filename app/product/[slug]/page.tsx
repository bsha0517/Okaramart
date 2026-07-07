import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductAddToCart from "@/components/ProductAddToCart";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, reviews: true },
  });

  if (!product || !product.isActive) notFound();

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
    : 0;

  const images = product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  const attributes = (product.attributes as Record<string, string> | null) ?? {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-char/50 mb-4 flex items-center gap-1.5">
        <a href="/" className="hover:text-canal">Home</a>
        <span>/</span>
        <a href={`/category/${product.category.slug}`} className="hover:text-canal">{product.category.name}</a>
        <span>/</span>
        <span className="text-char">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <ProductGallery images={images} name={product.name} />

        <div>
          <div className="bg-white border border-canal/10 rounded-2xl p-5 mb-5">
            {product.brand && <p className="text-xs text-char/50 uppercase tracking-wide mb-1">{product.brand}</p>}
            <h1 className="font-display text-2xl text-char font-semibold mb-2">{product.name}</h1>
            <p className="text-sm text-char/60 mb-3">
              Net Qty: {product.unit}
              {avgRating && <span className="text-canal font-medium ml-2">★ {avgRating.toFixed(1)} ({product.reviews.length})</span>}
            </p>

            <div className="inline-flex items-baseline gap-2 border border-canal/20 rounded-lg px-3 py-2 mb-2">
              <span className="font-display text-2xl font-bold text-char">Rs {Number(product.price).toFixed(0)}</span>
            </div>
            {hasDiscount && (
              <p className="text-sm text-char/60 mb-4">
                MRP <span className="line-through">Rs {Number(product.compareAtPrice).toFixed(0)}</span> (incl. of all taxes){" "}
                <span className="text-canal font-semibold">{discountPct}% OFF</span>
              </p>
            )}

            <div className="flex gap-6 mb-5 text-xs text-char/60">
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full border border-canal/20 flex items-center justify-center">↩</div>
                Easy returns
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full border border-canal/20 flex items-center justify-center">⚡</div>
                Fast delivery
              </div>
            </div>

            <ProductAddToCart product={product} />
          </div>

          {Object.keys(attributes).length > 0 && (
            <div className="bg-white border border-canal/10 rounded-2xl p-5 mb-5">
              <h2 className="font-semibold text-char mb-3">Highlights</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.brand && (
                    <tr className="border-t border-canal/5 first:border-t-0">
                      <td className="py-2 pr-4 text-char/50 w-1/3">Brand</td>
                      <td className="py-2 text-char">{product.brand}</td>
                    </tr>
                  )}
                  <tr className="border-t border-canal/5">
                    <td className="py-2 pr-4 text-char/50 w-1/3">Category</td>
                    <td className="py-2 text-char">{product.category.name}</td>
                  </tr>
                  <tr className="border-t border-canal/5">
                    <td className="py-2 pr-4 text-char/50 w-1/3">Unit</td>
                    <td className="py-2 text-char">{product.unit}</td>
                  </tr>
                  {Object.entries(attributes).map(([key, value]) => (
                    <tr key={key} className="border-t border-canal/5">
                      <td className="py-2 pr-4 text-char/50 w-1/3">{key}</td>
                      <td className="py-2 text-char">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.description && (
            <div className="bg-white border border-canal/10 rounded-2xl p-5 mb-5">
              <h2 className="font-semibold text-char mb-2">Information</h2>
              <p className="text-sm text-char/70 whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="bg-white border border-canal/10 rounded-2xl p-5 text-xs text-char/50 space-y-3">
            <p>
              <span className="font-semibold text-char/70">Disclaimer: </span>
              All images are for representational purposes only. Please check packaging
              for batch details, manufacturing information, and allergen warnings before use.
            </p>
            <p>
              <span className="font-semibold text-char/70">Customer care: </span>
              Questions about this product? <a href="/contact" className="text-canal underline">Contact Okara Mart support</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
