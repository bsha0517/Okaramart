"use client";

import { useCartStore } from "@/components/cartStore";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-canal mb-6">Your cart</h1>

      {items.length === 0 ? (
        <p className="text-char/60">
          Your cart is empty. <a href="/" className="text-canal underline">Browse products</a>
        </p>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between bg-white rounded-lg border border-canal/10 p-3">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-char/50">Rs {item.price} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-canal/20 rounded-full">
                    <button className="px-3 py-1" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button className="px-3 py-1" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-brick text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-medium text-lg mb-6">
            <span>Subtotal</span>
            <span>Rs {subtotal.toFixed(0)}</span>
          </div>

          <a
            href="/checkout"
            className="block text-center bg-canal text-husk font-semibold rounded-full py-3 hover:bg-canal/90"
          >
            Proceed to checkout
          </a>
        </>
      )}
    </div>
  );
}
