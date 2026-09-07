"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { flagIcons } from "@/components/shared/flag-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { localeLabels, locales } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types";

export function LanguageSwitcher({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "onBrand";
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function change(next: AppLocale | null) {
    if (!next || next === locale) return;
    startTransition(() => {
      // Pathnames are not localized, so `usePathname()` already carries the
      // resolved dynamic segments (e.g. `/products/cardio-control`).
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <Select value={locale} onValueChange={change}>
      <SelectTrigger
        aria-label={t("language")}
        className={cn(
          "!h-10 gap-2 rounded-lg border px-3 text-sm font-medium transition-colors [&>svg:last-child]:hidden",
          variant === "light"
            ? "border-line bg-white text-ink hover:bg-surface-soft"
            : "border-white/40 bg-white/10 text-white hover:bg-white/20",
          isPending && "opacity-60",
          className
        )}
      >
        {/* The trigger renders its own chevron — flag plus locale code here. */}
        <SelectValue>
          {(value: string | null) => {
            const active = (value ?? locale) as AppLocale;
            const Flag = flagIcons[active];
            return (
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-6 shrink-0 rounded-[3px]" />
                <span className="text-sm font-semibold">{localeLabels[active].short}</span>
                <span className="sr-only">{localeLabels[active].full}</span>
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>

      <SelectContent align="end" className="min-w-44">
        {locales.map((item) => {
          const Flag = flagIcons[item];
          return (
            <SelectItem key={item} value={item}>
              <span className="flex items-center gap-2.5">
                <Flag className="h-4 w-6 shrink-0 rounded-[3px]" />
                {localeLabels[item].full}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
