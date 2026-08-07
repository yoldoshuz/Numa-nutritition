/**
 * Projects backend content onto the next-intl message tree.
 *
 * The seeded catalogue stores product copy under `attributes.content[locale]`
 * and article bodies under `content[locale]`, in exactly the shape the message
 * bundles use for `Product.<slug>` and `Blog.posts.<slug>`. Overlaying them at
 * the i18n layer means every existing `useTranslations("Product.cardio-control")`
 * call transparently reads live content — no component has to know the backend
 * exists, and an unreachable backend simply leaves the bundled copy in place.
 */

import type { AppLocale } from "@/lib/i18n/routing";

import { fetchApiBlogPosts, fetchApiProducts } from "./catalog";

type Dict = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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

/**
 * Builds `{ Product: {...}, Blog: { posts: {...} } }` for one locale.
 * Returns an empty object when the API is unavailable, which makes the merge a
 * no-op and leaves the storefront on its bundled copy.
 */
export async function buildContentMessages(locale: AppLocale): Promise<Dict> {
  const [products, posts] = await Promise.all([fetchApiProducts(), fetchApiBlogPosts()]);

  const productCopy: Dict = {};
  for (const product of products ?? []) {
    const content = product.attributes?.content?.[locale];
    if (isPlainObject(content)) productCopy[product.slug] = content;
  }

  const postCopy: Dict = {};
  for (const post of posts ?? []) {
    const content = post.content?.[locale];
    // Posts written in the admin CMS store a plain string here; those are
    // rendered directly by the article page and must not clobber the structured
    // message entry a static post relies on.
    if (isPlainObject(content)) postCopy[post.slug] = content;
  }

  const overlay: Dict = {};
  if (Object.keys(productCopy).length) overlay.Product = productCopy;
  if (Object.keys(postCopy).length) overlay.Blog = { posts: postCopy };

  return overlay;
}
