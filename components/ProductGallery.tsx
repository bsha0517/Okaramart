"use client";

import { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div className="flex gap-3">
      {hasImages && images.length > 1 && (
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-14 h-14 rounded-lg border overflow-hidden ${active === i ? "border-canal" : "border-canal/15"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 aspect-square bg-white border border-canal/10 rounded-2xl overflow-hidden flex items-center justify-center">
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[active]} alt={name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-char/30 text-sm">No image</span>
        )}
      </div>
    </div>
  );
}
