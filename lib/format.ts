import type { AppLocale } from "@/lib/i18n/routing";

const priceLocale: Record<AppLocale, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

/** `400000` → `400 000` (grouped with a non-breaking space, as in the design). */
export function formatAmount(value: number, locale: AppLocale = "ru"): string {
  return new Intl.NumberFormat(priceLocale[locale], {
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/ /g, " ");
}

export function formatDate(iso: string, locale: AppLocale = "ru"): string {
  return new Intl.DateTimeFormat(priceLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
