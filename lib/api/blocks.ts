/**
 * Turns the admin's product-page blocks into the shapes this storefront's
 * sections already render.
 *
 * Every section below the price used to read its words from
 * `messages/<locale>.json`, keyed by product slug — which meant the only people
 * who could change what a bottle of Insulin Balance claims were the people with a git
 * checkout. The admin now owns those sections, and this module is the seam:
 * blocks in, the section's own props out, with the bundled copy still standing
 * behind anything the CMS has not filled in.
 *
 * A block the moderator has not published never arrives here — the backend
 * filters on `isVisible` — so anything in `blocks` is meant to be on the page.
 */

import type { AppLocale } from "@/lib/i18n/routing";
import type { ApiProductBlock, ApiProductBlockType } from "./types";

/** Order the languages are tried in when the reader's is blank. */
const FALLBACK_LOCALES: AppLocale[] = ["ru", "uz", "en"];

/**
 * One localized leaf, in the reader's language.
 *
 * Falls through to the other languages rather than rendering a hole: content
 * is filled in language by language (ru first, then uz and en), and a visible
 * block with one untranslated line should print that line, not an empty card
 * with the layout still holding space for it. Publication is controlled in the
 * admin with the visibility switch, which is the lever for "not ready yet".
 */
function text(value: unknown, locale: AppLocale): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";

  const map = value as Record<string, unknown>;
  for (const key of [locale, ...FALLBACK_LOCALES]) {
    const candidate = map[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return "";
}

const rows = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? (value.filter((row) => row && typeof row === "object") as Record<string, unknown>[])
    : [];

const percent = (value: unknown): number => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : 0;
};

/* ── resolved shapes ─────────────────────────────────────────────────────── */

export interface TitledText {
  title: string;
  text: string;
}

export interface ProductContent {
  hero?: { badge: string; tagline: string; text: string };
  /** Arbitrary label/value rows — the CMS is not limited to the six the design shipped. */
  specs?: { title: string; items: { label: string; value: string }[] };
  benefits?: { title: string; subtitle: string; items: TitledText[] };
  howToUse?: { title: string; subtitle: string; steps: TitledText[] };
  warnings?: { title: string; items: string[] };
  about?: { title: string; text: string; stats: { value: string; label: string }[] };
  advantages?: { title: string; items: string[] };
  metrics?: {
    title: string;
    items: { title: string; description: string; percent: number }[];
  };
  faq?: { title: string; items: { question: string; answer: string }[] };
}

/**
 * The sections of a product page, in the order the admin arranged them.
 *
 * `hero` and `specs` are not in this list: they are part of the buy box at the
 * top of the page, which has a fixed place above everything else.
 */
export const CONTENT_SECTIONS = [
  "benefits",
  "howToUse",
  "about",
  "advantages",
  "metrics",
  "faq",
] as const;

export type ContentSection = (typeof CONTENT_SECTIONS)[number];

/** Which resolved section each block type feeds. */
const SECTION_OF: Partial<Record<ApiProductBlockType, ContentSection>> = {
  benefits: "benefits",
  how_to_use: "howToUse",
  about: "about",
  advantages: "advantages",
  metrics: "metrics",
  faq: "faq",
};

/* ── resolution ──────────────────────────────────────────────────────────── */

/**
 * Folds a product's blocks into one object of section content.
 *
 * A section is only present when its block carries something worth printing —
 * the backend seeds every new product with a skeleton of nine blocks, and an
 * all-blank one must leave the bundled copy in charge rather than blank the
 * page it was meant to fill.
 */
export function resolveProductContent(
  blocks: ApiProductBlock[] | undefined,
  locale: AppLocale,
): ProductContent {
  const content: ProductContent = {};

  for (const block of blocks ?? []) {
    const data = block.data ?? {};
    const t = (key: string) => text(data[key], locale);

    switch (block.type) {
      case "hero": {
        const hero = { badge: t("badge"), tagline: t("tagline"), text: t("text") };
        if (hero.tagline || hero.text || hero.badge) content.hero = hero;
        break;
      }

      case "specs": {
        const items = rows(data.items)
          .map((row) => ({
            label: text(row.label, locale),
            value: text(row.value, locale),
          }))
          .filter((row) => row.label || row.value);
        if (items.length) content.specs = { title: t("title"), items };
        break;
      }

      case "benefits": {
        const items = rows(data.items)
          .map((row) => ({
            title: text(row.title, locale),
            text: text(row.text, locale),
          }))
          .filter((row) => row.title || row.text);
        if (items.length) {
          content.benefits = { title: t("title"), subtitle: t("subtitle"), items };
        }
        break;
      }

      case "how_to_use": {
        const steps = rows(data.steps)
          .map((row) => ({
            title: text(row.title, locale),
            text: text(row.text, locale),
          }))
          .filter((row) => row.title || row.text);
        if (steps.length) {
          content.howToUse = { title: t("title"), subtitle: t("subtitle"), steps };
        }
        break;
      }

      case "warnings": {
        const items = rows(data.items)
          .map((row) => text(row.text, locale))
          .filter(Boolean);
        if (items.length) content.warnings = { title: t("title"), items };
        break;
      }

      case "about": {
        const stats = rows(data.stats)
          .map((row) => ({
            value: text(row.value, locale),
            label: text(row.label, locale),
          }))
          .filter((row) => row.value || row.label);
        const title = t("title");
        const body = t("text");
        if (title || body || stats.length) {
          content.about = { title, text: body, stats };
        }
        break;
      }

      case "advantages": {
        const items = rows(data.items)
          .map((row) => text(row.text, locale))
          .filter(Boolean);
        if (items.length) content.advantages = { title: t("title"), items };
        break;
      }

      case "metrics": {
        const items = rows(data.items)
          .map((row) => ({
            title: text(row.title, locale),
            description: text(row.description, locale),
            percent: percent(row.percent),
          }))
          .filter((row) => row.title || row.description);
        if (items.length) content.metrics = { title: t("title"), items };
        break;
      }

      case "faq": {
        const items = rows(data.items)
          .map((row) => ({
            question: text(row.question, locale),
            answer: text(row.answer, locale),
          }))
          .filter((row) => row.question && row.answer);
        if (items.length) content.faq = { title: t("title"), items };
        break;
      }
    }
  }

  return content;
}

/**
 * The order to render the page's sections in.
 *
 * Follows the admin's arrangement for every section it actually publishes, then
 * appends the rest in the design's own sequence — a product whose landing has
 * not been filled in keeps the page it has today, and one that has been
 * partially filled in does not lose the sections still coming from the bundle.
 */
export function resolveSectionOrder(
  blocks: ApiProductBlock[] | undefined,
): ContentSection[] {
  const ordered: ContentSection[] = [];

  for (const block of [...(blocks ?? [])].sort((a, b) => a.position - b.position)) {
    const section = SECTION_OF[block.type];
    if (section && !ordered.includes(section)) ordered.push(section);
  }

  for (const section of CONTENT_SECTIONS) {
    if (!ordered.includes(section)) ordered.push(section);
  }

  return ordered;
}
