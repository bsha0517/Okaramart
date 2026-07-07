"use client";

import { useCartStore } from "./cartStore";

export default function ProductAddToCart({ product }: { product: any }) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const qtyInCart = useCartStore((s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0);

  const outOfStock = product.stockQty <= 0;

  if (outOfStock) {
    return (
      <button disabled className="w-full border border-brick/30 text-brick font-semibold rounded-lg py-3 opacity-70">
        Out of stock
      </button>
    );
  }

  if (qtyInCart === 0) {
    return (
      <button
        onClick={() => addItem({ productId: product.id, name: product.name, price: Number(product.price), quantity: 1 })}
        className="w-full border-2 border-canal text-canal font-semibold rounded-lg py-3 hover:bg-canal/5"
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between border-2 border-canal rounded-lg overflow-hidden">
      <button
        onClick={() => updateQuantity(product.id, qtyInCart - 1)}
        className="flex-1 py-3 text-canal font-bold text-lg"
      >
        −
      </button>
      <span className="px-4 font-semibold text-canal">{qtyInCart} in cart</span>
      <button
        onClick={() => updateQuantity(product.id, qtyInCart + 1)}
        disabled={qtyInCart >= product.stockQty}
        className="flex-1 py-3 text-canal font-bold text-lg disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
