"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives the scroll-snap carousels used across the site. Keeps the arrow
 * buttons in sync with the native scroll position so keyboard, touch and
 * mouse-wheel interaction all stay first class.
 */
export function useScrollCarousel<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const sync = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setCanScrollPrev(node.scrollLeft > 8);
    setCanScrollNext(node.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    sync();
    node.addEventListener("scroll", sync, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollBy = useCallback((direction: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    const first = node.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 24 : node.clientWidth * 0.8;
    node.scrollBy({ left: step * direction, behavior: "smooth" });
  }, []);

  return {
    ref,
    canScrollPrev,
    canScrollNext,
    scrollPrev: () => scrollBy(-1),
    scrollNext: () => scrollBy(1),
  };
}
