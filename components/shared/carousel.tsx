"use client";

import { Children } from "react";
import { useTranslations } from "next-intl";

import { CarouselControls } from "@/components/shared/carousel-controls";
import { useScrollCarousel } from "@/hooks";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: React.ReactNode;
  /** Width classes applied to every slide. */
  itemClassName?: string;
  className?: string;
  trackClassName?: string;
  /** `top` docks the arrows above the track, `bottom` underneath it. */
  controls?: "top" | "bottom" | "none";
  label: string;
}

/**
 * Native scroll-snap carousel: keyboard, trackpad and touch all work, with the
 * arrow buttons layered on top. Controls sit outside the track so they never
 * cover a slide.
 */
export function Carousel({
  children,
  itemClassName,
  className,
  trackClassName,
  controls = "top",
  label,
}: CarouselProps) {
  const t = useTranslations("Common");
  const { ref, canScrollPrev, canScrollNext, scrollPrev, scrollNext } =
    useScrollCarousel<HTMLDivElement>();

  const slides = Children.toArray(children);

  const buttons =
    controls === "none" ? null : (
      <CarouselControls
        onPrev={scrollPrev}
        onNext={scrollNext}
        canPrev={canScrollPrev}
        canNext={canScrollNext}
        prevLabel={t("prev")}
        nextLabel={t("next")}
      />
    );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {controls === "top" ? <div className="flex justify-end">{buttons}</div> : null}

      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:gap-6",
          trackClassName
        )}
      >
        {slides.map((slide, index) => (
          <div key={index} className={cn("shrink-0 snap-start", itemClassName)}>
            {slide}
          </div>
        ))}
      </div>

      {controls === "bottom" ? <div className="flex justify-center">{buttons}</div> : null}
    </div>
  );
}
