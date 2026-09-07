import { defineRouting } from "next-intl/routing";

/**
 * Uzbek first, and first in this list: the shop sells in Uzbekistan, and the
 * order here is the order the language switcher offers.
 */
export const locales = ["uz", "ru", "en"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "uz";

/** Maps our locale codes to valid BCP-47 tags for `<html lang>` and `hreflang`. */
export const htmlLang: Record<AppLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

/** Human readable labels used by the language switcher. */
export const localeLabels: Record<AppLocale, { short: string; full: string }> = {
  uz: { short: "Uz", full: "O'zbekcha" },
  ru: { short: "Ru", full: "Русский" },
  en: { short: "En", full: "English" },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // `/` serves Uzbek, `/ru` and `/en` are prefixed. Keeps the primary market
  // on clean URLs while still giving every language a canonical address.
  localePrefix: "as-needed",
  localeDetection: false,
});
