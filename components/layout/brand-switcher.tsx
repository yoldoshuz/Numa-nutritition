"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { LogoMark } from "@/components/shared/logo";
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
      {/*
        The logo used to be the whole trigger, with nothing to say it was one —
        so the menu into the rest of the group went unfound. It now sits in a
        pill that tints under the pointer, with a switcher grid beside it — the
        same "there is more than this one product here" mark the app launchers
        use, readable at a glance and without a caret.
      */}
      <button
        type="button"
        aria-label={t("Common.otherBrands")}
        title={t("Common.otherBrands")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group -mx-2 flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:gap-3",
          open ? "bg-teal-logo/10" : "hover:bg-teal-logo/8",
        )}
      >
        <LogoMark priority />
        <SwitcherGrid open={open} />
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


/**
 * Nine dots — the switcher mark.
 *
 * Deliberately not a caret: a caret next to a wordmark reads as "this label has
 * a submenu", while the grid reads as "there are sibling products behind this".
 * It sits at 55% until the pointer arrives, so it hints rather than competes
 * with the logo, and the dots spread a hair on hover so the whole trigger
 * answers the cursor.
 *
 * `teal-logo` and not the brand green: the dots sit two millimetres from the
 * wordmark, and the wordmark artwork is teal. Two different greens that close
 * together read as a mismatch rather than as an accent, so the trigger takes
 * the colour of the mark it belongs to — hover tint included.
 */
function SwitcherGrid({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 grid-cols-3 transition-[gap,opacity] duration-200",
        open
          ? "gap-[3px] opacity-100"
          : "gap-[2px] opacity-55 group-hover:gap-[3px] group-hover:opacity-100",
      )}
    >
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className="size-[3.5px] rounded-full bg-teal-logo" />
      ))}
    </span>
  );
}
