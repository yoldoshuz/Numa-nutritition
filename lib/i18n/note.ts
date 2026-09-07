import type { AppLocale } from "./routing";

/**
 * The editor's note for an article's product strip, but only where it belongs.
 *
 * `blog_post_products.note` is a single column on the backend, not a
 * `{uz, ru, en}` map like everything else the CMS stores — so one note written
 * in Russian was printed on all three language versions of the page, under an
 * English heading. That is the "translation is not finished" the shop reported:
 * the heading and the products were translated, the line between them was not.
 *
 * Until the column is localized, the note is shown only to readers of the
 * script it is written in, and everyone else gets the bundled subtitle, which
 * is a proper sentence in their language. A wrong-language line is worse than a
 * generic right-language one.
 */
const CYRILLIC = /[Ѐ-ӿ]/;

/** Locales this storefront writes in Cyrillic. Uzbek here is Latin. */
const CYRILLIC_LOCALES = new Set<AppLocale>(["ru"]);

export function noteForLocale(
  note: string | null | undefined,
  locale: AppLocale,
): string | null {
  const text = note?.trim();
  if (!text) return null;
  return CYRILLIC.test(text) === CYRILLIC_LOCALES.has(locale) ? text : null;
}
