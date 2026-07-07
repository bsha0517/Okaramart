"use client";

import { useCartStore } from "./cartStore";
import { useEffect, useState } from "react";

export default function CartNavLink() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  // Avoids a hydration mismatch: the cart is persisted in localStorage,
  // which isn't available during server-side rendering, so we only show
  // the real count once mounted on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <a href="/cart" className="relative text-canal font-semibold">
      Cart
      {mounted && count > 0 && (
        <span className="absolute -top-2 -right-3 bg-brick text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </a>
  );
}
