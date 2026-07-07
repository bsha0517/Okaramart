"use client";

import { useRef } from "react";
import { getCategoryIcon } from "@/lib/categoryIcons";

type Category = { id: string; name: string; slug: string; imageUrl?: string | null };

export default function CategoryCarousel({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollNext() {
    scrollerRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  }

  return (
    <section className="mb-8 relative">
      <div ref={scrollerRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none]">
        {categories.map((c) => (
          <a key={c.id} href={`/category/${c.slug}`} className="shrink-0 w-20 text-center group">
            <div className="w-20 h-20 rounded-2xl bg-wheat/15 border border-canal/10 overflow-hidden flex items-center justify-center mb-1.5 group-hover:border-canal/30 group-hover:bg-wheat/25 transition-colors">
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{getCategoryIcon(c.slug)}</span>
              )}
            </div>
            <span className="text-xs font-medium text-char leading-tight">{c.name}</span>
          </a>
        ))}
      </div>
      <button
        onClick={scrollNext}
        aria-label="Show more categories"
        className="hidden sm:flex absolute right-0 top-1/3 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-canal/15 shadow items-center justify-center text-canal"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}
