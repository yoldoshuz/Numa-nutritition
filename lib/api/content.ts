/**
 * Projects backend content onto the next-intl message tree.
 *
 * Every visible string on a product or article page is read through
 * `useTranslations("Product.<slug>")` / `Blog.posts.<slug>`, so this overlay is
 * the only way live copy reaches a component — no component knows the backend
 * exists, and an unreachable backend simply leaves the bundled copy in place.
 *
 * Three sources feed one entry, in this order:
 *
 *   1. the storefront's own message bundle (the `base` this is merged onto);
 *   2. `attributes.content[locale]` / `content[locale]`, written by the seed;
 *   3. the record's own `name` / `description` / `title` / `excerpt` columns.
 *
 * (3) wins because it is the only part a moderator can actually edit — the
 * admin's product form writes `name` and `description` and nothing else. While
 * the seed blob outranked them, renaming a product in the CMS changed nothing
 * on the storefront, which read exactly like the backend was being ignored.
 */

import type { AppLocale } from "@/lib/i18n/routing";

import { fetchApiBlogPosts, fetchApiProducts } from "./catalog";

type Dict = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asDict = (value: unknown): Dict => (isPlainObject(value) ? value : {});

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/**
 * Recursively merges `overlay` onto `base`. Arrays are replaced wholesale —
 * an article's `sections` is a single editorial unit, not something to splice.
 */
export function deepMerge<T extends Dict>(base: T, overlay: Dict): T {
  const out: Dict = { ...base };

  for (const [key, value] of Object.entries(overlay)) {
    if (value === undefined || value === null) continue;
    const current = out[key];
    out[key] =
      isPlainObject(current) && isPlainObject(value) ? deepMerge(current, value) : value;
  }

  return out as T;
}

/** The first entry that is an object — the sub-tree shape one record occupies. */
const templateOf = (entries: Dict): Dict =>
  asDict(Object.values(entries).find(isPlainObject));

/** The same shape with no words in it: strings blanked, lists emptied. */
function blankLike(shape: unknown): unknown {
  if (typeof shape === "string") return "";
  if (Array.isArray(shape)) return [];
  if (isPlainObject(shape)) {
    const out: Dict = {};
    for (const [key, value] of Object.entries(shape)) out[key] = blankLike(value);
    return out;
  }
  return shape;
}

/** Single-string copy slots — all of them get the record's one description. */
const PROSE_KEYS = new Set([
  "short",
  "tagline",
  "subtitle",
  "excerpt",
  "lead",
  "intro",
  "long",
  "body",
  "description",
]);

/**
 * A full message sub-tree for a record the storefront ships no copy for — one
 * created in the admin.
 *
 * Modelled on an existing entry rather than hand-listed, so it always carries
 * every key the components read and keeps up with the bundle on its own.
 * Without it `getTranslations` throws MISSING_MESSAGE and the detail page
 * answers 500, which is what every CMS-authored product used to do.
 */
function skeleton(template: Dict, headline: string, prose: string): Dict {
  const out = asDict(blankLike(template));
  for (const key of Object.keys(out)) {
    if (typeof out[key] !== "string") continue;
    if (PROSE_KEYS.has(key)) out[key] = prose;
  }
  if ("name" in out) out.name = headline;
  if ("title" in out) out.title = headline;
  return out;
}

/**
 * Builds `{ Product: {...}, Blog: { posts: {...} } }` for one locale.
 *
 * `base` is the bundled message tree this will be merged onto. It is read so
 * the skeleton is only used for records the storefront does not already ship
 * copy for — otherwise a blanked `sections` would wipe out a shipped article.
 *
 * Returns an empty object when the API is unavailable, which makes the merge a
 * no-op and leaves the storefront on its bundled copy.
 */
export async function buildContentMessages(
  locale: AppLocale,
  base: Dict = {},
): Promise<Dict> {
  const [products, posts] = await Promise.all([fetchApiProducts(), fetchApiBlogPosts()]);

  const bundledProducts = asDict(base.Product);
  const bundledPosts = asDict(asDict(base.Blog).posts);
  const productTemplate = templateOf(bundledProducts);
  const postTemplate = templateOf(bundledPosts);

  const productCopy: Dict = {};
  for (const product of products ?? []) {
    const seeded = asDict(product.attributes?.content?.[locale]);
    const shipped = asDict(bundledProducts[product.slug]);
    const name = text(product.name?.[locale]);
    const description = text(product.description?.[locale]);

    const entry: Dict = {
      ...(Object.keys(shipped).length
        ? {}
        : skeleton(productTemplate, name || product.slug, description)),
      ...seeded,
    };
    if (name) entry.name = name;
    if (description) entry.description = description;

    if (Object.keys(entry).length) productCopy[product.slug] = entry;
  }

  const postCopy: Dict = {};
  for (const post of posts ?? []) {
    const raw = post.content?.[locale];
    // A seeded article carries the structured body; one written in the admin
    // carries a plain string, which is prose rather than a message sub-tree.
    const seeded = asDict(raw);
    const shipped = asDict(bundledPosts[post.slug]);
    const title = text(post.title?.[locale]);
    const excerpt = text(post.excerpt?.[locale]);

    const entry: Dict = {
      ...(Object.keys(shipped).length
        ? {}
        : skeleton(postTemplate, title || post.slug, text(raw) || excerpt)),
      ...seeded,
    };
    if (title) entry.title = title;
    if (excerpt) entry.excerpt = excerpt;

    if (Object.keys(entry).length) postCopy[post.slug] = entry;
  }

  const overlay: Dict = {};
  if (Object.keys(productCopy).length) overlay.Product = productCopy;
  if (Object.keys(postCopy).length) overlay.Blog = { posts: postCopy };

  return overlay;
}
