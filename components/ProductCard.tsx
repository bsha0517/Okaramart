"use client";

import { useCartStore } from "./cartStore";

export default function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const qtyInCart = useCartStore((s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0);

  const outOfStock = product.stockQty <= 0;
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  return (
    <div className="bg-white rounded-2xl border border-canal/10 p-2.5 flex flex-col relative">
      <a href={`/product/${product.slug}`} className="block">
        <div className="aspect-square bg-husk rounded-xl mb-2 flex items-center justify-center text-char/30 text-xs overflow-hidden relative">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            "No image"
          )}
        </div>
      </a>

      {/* Quantity stepper floats over the image, bottom-right — the
          quick-commerce pattern (Zepto/Blinkit/Instamart) instead of a
          separate "Add" button below the price. Positioned outside the
          link so tapping +/- doesn't navigate to the product page. */}
      <div className="absolute" style={{ top: "calc(100% - 2.5rem - 0.375rem)", right: "0.6rem" }}>
        {outOfStock ? null : qtyInCart === 0 ? (
          <button
            onClick={() => addItem({ productId: product.id, name: product.name, price: Number(product.price), quantity: 1 })}
            className="bg-white border border-canal text-canal text-xs font-bold rounded-lg px-3 py-1 shadow-sm active:scale-95 transition-transform"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center bg-canal text-husk rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => updateQuantity(product.id, qtyInCart - 1)}
              className="w-7 h-7 flex items-center justify-center text-sm font-bold active:bg-canal/80"
            >
              −
            </button>
            <span className="w-5 text-center text-xs font-bold">{qtyInCart}</span>
            <button
              onClick={() => updateQuantity(product.id, qtyInCart + 1)}
              disabled={qtyInCart >= product.stockQty}
              className="w-7 h-7 flex items-center justify-center text-sm font-bold active:bg-canal/80 disabled:opacity-40"
            >
              +
            </button>
          </div>
        )}
      </div>

      <a href={`/product/${product.slug}`} className="block">
        <p className="text-xs text-char/50 mb-0.5">{product.unit}</p>
        <h3 className="font-medium text-sm text-char line-clamp-2 mb-1.5 min-h-[2.5em]">{product.name}</h3>
      </a>

      <div className="mt-auto flex items-baseline gap-1.5">
        <span className="font-display text-char font-semibold text-sm">Rs {Number(product.price).toFixed(0)}</span>
        {hasDiscount && (
          <span className="text-xs text-char/40 line-through">Rs {Number(product.compareAtPrice).toFixed(0)}</span>
        )}
      </div>

      {outOfStock && (
        <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center pointer-events-none">
          <span className="text-xs text-brick font-semibold bg-white border border-brick/20 rounded-full px-3 py-1">
            Out of stock
          </span>
        </div>
      )}
    </div>
  );
}
