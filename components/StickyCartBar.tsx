"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "./cartStore";

export default function StickyCartBar() {
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (count === 0) return null;

  return (
    <a
      href="/cart"
      className="fixed bottom-0 left-0 right-0 z-40 bg-canal text-husk px-4 py-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.1)]"
    >
      <div className="text-sm">
        <span className="font-bold">{count} item{count !== 1 ? "s" : ""}</span>
        <span className="opacity-80"> · Rs {subtotal.toFixed(0)}</span>
      </div>
      <span className="font-semibold text-sm flex items-center gap-1">
        View cart
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}
