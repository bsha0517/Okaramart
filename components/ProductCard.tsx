"use client";

import { useCartStore } from "./cartStore";

export default function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((s) => s.addItem);
  const qtyInCart = useCartStore((s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0);

  const outOfStock = product.stockQty <= 0;

  return (
    <div className="bg-white rounded-xl border border-canal/10 p-3 flex flex-col">
      <div className="aspect-square bg-husk rounded-lg mb-3 flex items-center justify-center text-char/30 text-xs overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          "No image"
        )}
      </div>
      <h3 className="font-medium text-sm text-char line-clamp-2">{product.name}</h3>
      <p className="text-xs text-char/50 mb-2">{product.unit}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-display text-canal font-semibold">Rs {Number(product.price).toFixed(0)}</span>
        {outOfStock ? (
          <span className="text-xs text-brick font-medium">Out of stock</span>
        ) : (
          <button
            onClick={() => addItem({ productId: product.id, name: product.name, price: Number(product.price), quantity: 1 })}
            className="text-xs font-semibold bg-canal text-husk rounded-full px-3 py-1.5 hover:bg-canal/90"
          >
            {qtyInCart > 0 ? `In cart (${qtyInCart})` : "Add"}
          </button>
        )}
      </div>
    </div>
  );
}
