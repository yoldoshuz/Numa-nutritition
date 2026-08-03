import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "en", "uz"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "ru";

/** Maps our locale codes to valid BCP-47 tags for `<html lang>` and `hreflang`. */
export const htmlLang: Record<AppLocale, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

/** Human readable labels used by the language switcher. */
export const localeLabels: Record<AppLocale, { short: string; full: string }> = {
  ru: { short: "Ru", full: "Русский" },
  en: { short: "En", full: "English" },
  uz: { short: "Uz", full: "O'zbekcha" },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // `/` serves Russian, `/en` and `/uz` are prefixed. Keeps the primary market
  // on clean URLs while still giving every language a canonical address.
  localePrefix: "as-needed",
  localeDetection: false,
});
