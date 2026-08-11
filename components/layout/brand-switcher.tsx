"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { Logo } from "@/components/shared/logo";
import { SIBLING_SITES } from "@/lib/data/content";
import { cn } from "@/lib/utils";

/**
 * The logo doubles as an entry point to the rest of the NUMA group.
 *
 * Ported from Numa Kids, where the pattern already shipped, and re-skinned in
 * this storefront's accent — the brand green rather than pink — so the group's
 * sites behave identically without any of them looking borrowed.
 */
export function BrandSwitcher({ className }: { className?: string }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // A short close delay keeps the menu open while the pointer crosses the gap
  // between the trigger and the panel.
  function schedule(next: boolean) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(next), next ? 0 : 150);
  }

  return (
    <div
      ref={wrapper}
      className={cn("relative", className)}
      onMouseEnter={() => schedule(true)}
      onMouseLeave={() => schedule(false)}
    >
      {/* The logo is the trigger — no separate affordance beside it. */}
      <button
        type="button"
        aria-label={t("Common.otherBrands")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <Logo priority />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-3 w-72 rounded-2xl border border-brand-200 bg-brand p-3 shadow-xl"
          role="menu"
        >
          {SIBLING_SITES.map((site) => (
            <a
              key={site.id}
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/20"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white p-1">
                <Image
                  src={site.logo}
                  alt=""
                  width={72}
                  height={72}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="flex-1 text-sm font-bold tracking-wide text-white">
                {site.label}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
