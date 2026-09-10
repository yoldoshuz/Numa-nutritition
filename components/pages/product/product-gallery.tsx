"use client";

import Image from "next/image";
import { useState } from "react";

import { ProductImage } from "@/components/shared/product-image";
import { galleryOf } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductGallery({ product, name }: { product: Product; name: string }) {
  /*
   * The slider's frames, taken from the four gallery places by name.
   *
   * It used to be `[hero, ...gallery]` deduped by path — a set assembled from
   * the upload pile, where the dedupe existed because the hero was usually also
   * one of the thumbnails and the two arrived as the same URL. Slots make both
   * problems go away: the moderator's placement is the slider, gaps included,
   * and a photo can only sit in one place.
   */
  const slides = galleryOf(product.images);
  const [active, setActive] = useState(0);
  const current = slides[active] ?? slides[0];

  return (
    <div className="flex flex-col gap-3">
      {/*
        The frame is square, like the slot: `gallery_*` is specified 1000×1000.
        It was 4:3, which is why an upright bottle sat in the middle of two grey
        bars — and letterboxing is the least bad answer only while the box and
        the photograph disagree about their shape.
      */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-mint">
        {current && (
          <ProductImage
            key={current.url}
            slug={product.slug}
            src={current.url}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="animate-fade-up object-contain p-6"
          />
        )}
      </div>

      {slides.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {slides.slice(1).map((slide, index) => (
            <button
              key={slide.url}
              type="button"
              onClick={() => setActive(index + 1)}
              aria-label={`${name} — ${index + 2}`}
              aria-pressed={active === index + 1}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-surface-mint transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active === index + 1
                  ? "border-brand"
                  : "border-transparent hover:border-brand-200"
              )}
            >
              {/* Matches the main frame above: whole product, never a slice. */}
              <Image
                src={slide.url}
                alt=""
                fill
                sizes="180px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
