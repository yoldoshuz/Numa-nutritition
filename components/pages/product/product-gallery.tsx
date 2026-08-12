"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductGallery({ product, name }: { product: Product; name: string }) {
  const slides = [product.hero, ...product.gallery];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-mint">
        <Image
          key={slides[active]}
          src={slides[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 560px"
          className="animate-fade-up object-contain p-6"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {slides.slice(1).map((slide, index) => (
          <button
            key={slide}
            type="button"
            onClick={() => setActive(index + 1)}
            aria-label={`${name} — ${index + 2}`}
            aria-pressed={active === index + 1}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-surface-mint transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              active === index + 1
                ? "border-brand"
                : "border-transparent hover:border-brand-200"
            )}
          >
            {/* Matches the main frame above: whole product, never a slice. */}
            <Image
              src={slide}
              alt=""
              fill
              sizes="180px"
              className="object-contain p-1.5"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
