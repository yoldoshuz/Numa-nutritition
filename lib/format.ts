import type { AppLocale } from "@/lib/i18n/routing";

const priceLocale: Record<AppLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

/**
 * `400000` → `400 000` (grouped with a non-breaking space, as in the design).
 *
 * The grouping is fixed rather than taken from the active locale on purpose.
 * `Intl.NumberFormat("uz-UZ")` disagrees between ICU builds — Node groups with
 * a non-breaking space, Chrome with a comma — so a locale-formatted price makes
 * the server HTML and the client render differ, and any price inside a client
 * component then throws a hydration mismatch. `ru-RU` groups with a space in
 * every ICU version, and the replace normalises whichever space it picks.
 */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })
    .format(value)
    .replace(/\s/g, " ");
}

export function formatDate(iso: string, locale: AppLocale = "uz"): string {
  return new Intl.DateTimeFormat(priceLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
