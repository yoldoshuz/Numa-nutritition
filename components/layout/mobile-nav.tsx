"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/shared/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mainNav } from "@/lib/data/content";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Navigating from inside the drawer closes it; handled per-link rather than
  // in an effect so no cascading render is triggered.
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("openMenu")}
        className="grid size-10 place-items-center rounded-lg border border-line text-ink transition-colors hover:bg-surface-soft lg:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-[min(21rem,88vw)] flex-col gap-0 p-0"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            className="grid size-10 place-items-center rounded-lg border border-line text-ink transition-colors hover:bg-surface-soft"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label={t("menuTitle")} className="flex flex-col gap-1 p-4">
          {mainNav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={close}
                className={cn(
                  "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-surface-soft"
                )}
              >
                {tNav(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-line p-5">
          <LanguageSwitcher className="w-full justify-between" />
          <Link
            href="/consultation"
            onClick={close}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            {tCommon("consultation")}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
