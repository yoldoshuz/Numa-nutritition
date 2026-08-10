"use client";

import { useTranslations } from "next-intl";

import { CartButton } from "@/components/layout/cart-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Container } from "@/components/shared/container";
import { BrandSwitcher } from "@/components/layout/brand-switcher";
import { useScrolled } from "@/hooks";
import { mainNav } from "@/lib/data/content";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const tHeader = useTranslations("Header");
  const pathname = usePathname();
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow duration-300",
        scrolled ? "shadow-[0_1px_0_0_var(--color-line),0_8px_24px_-20px_rgb(0_0_0/0.4)]" : ""
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {tHeader("skipToContent")}
      </a>

      <Container className="flex h-[4.5rem] items-center justify-between gap-4 lg:h-[6.5rem]">
        <BrandSwitcher />

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex xl:gap-12">
          {mainNav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 text-[0.9375rem] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 after:content-[''] hover:text-brand hover:after:scale-x-100",
                  active ? "font-semibold text-brand after:scale-x-100" : "text-ink"
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <CartButton />
          <LanguageSwitcher className="hidden sm:flex" />
          <Link
            href="/consultation"
            className="hidden h-10 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:inline-flex"
          >
            {tCommon("consultation")}
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
