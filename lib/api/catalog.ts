/**
 * Server-side catalogue reads, with the bundled static catalogue as a fallback.
 *
 * Used for the first paint and for metadata; the browser refetches the same
 * data through the hooks in `hooks/use-catalog.ts`, so a moderator's edit shows
 * up without a redeploy.
 */

import {
  blogPosts as staticBlogPosts,
  getPost as getStaticPost,
} from "@/lib/data/content";
import {
  getProduct as getStaticProduct,
  products as staticProducts,
} from "@/lib/data/products";
import { isSoldOut } from "@/lib/utils";
import type { BlogPost, Product } from "@/types";

import { isApiConfigured } from "./config";
import {
  getBlogFeed,
  getBlogPostBySlug,
  getFeatured,
  getProductBySlug,
  getProductList,
} from "./endpoints";
import { toBlogPost, toProduct } from "./mappers";
import type { ApiBlogPost, ApiProduct } from "./types";

/* ── fetchers ────────────────────────────────────────────────────────────── */

/** Resolves to `null` on any failure, which is the caller's cue to fall back. */
async function tryFetch<T>(run: () => Promise<T>): Promise<T | null> {
  if (!isApiConfigured()) return null;
  try {
    return await run();
  } catch {
    return null;
  }
}

/** Raw API products — used by the i18n content overlay, which needs `attributes`. */
export async function fetchApiProducts(): Promise<ApiProduct[] | null> {
  return tryFetch(async () => (await getProductList()).products ?? []);
}

export async function fetchApiBlogPosts(): Promise<ApiBlogPost[] | null> {
  return tryFetch(async () => {
    const data = await getBlogFeed();
    return Array.isArray(data) ? data : (data.posts ?? []);
  });
}

/* ── public surface ──────────────────────────────────────────────────────── */

export async function getProducts(): Promise<Product[]> {
  const api = await fetchApiProducts();
  if (!api?.length) return staticProducts;
  return api.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const api = await tryFetch(() => getProductBySlug(slug));
  return api ? toProduct(api) : getStaticProduct(slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const api = await tryFetch(async () => {
    const data = await getFeatured();
    return Array.isArray(data) ? data : (data.rows ?? []);
  });

  if (!api?.length) return staticProducts.filter((p) => p.featured);
  /*
   * Sold-out products are dropped here rather than badged.
   *
   * The catalogue has to keep listing them — people search for a product by
   * name and need to find it, if only to read that it is gone. A "popular
   * products" shelf is the opposite job: a shortlist the storefront chose, and
   * spending one of its few slots on something nobody can buy is a waste of the
   * best space on the home page. `isFeatured` is set in the admin and never
   * cleared when stock runs out, so the filter belongs on this side.
   */
  return api.map(toProduct).filter((product) => !isSoldOut(product));
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return all.slice(0, limit);

  return [
    ...all.filter((p) => p.slug !== slug && p.form === current.form),
    ...all.filter((p) => p.slug !== slug && p.form !== current.form),
  ].slice(0, limit);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const api = await fetchApiBlogPosts();
  if (!api?.length) return staticBlogPosts;

  return api
    .map(toBlogPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const api = await tryFetch(() => getBlogPostBySlug(slug));
  return api ? toBlogPost(api) : getStaticPost(slug);
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const all = await getBlogPosts();
  return all.filter((post) => post.slug !== slug).slice(0, limit);
}

/**
 * The products an article recommends, with the editor's note for the lead one.
 *
 * An article that explains what a formula does and then stops is a dead end —
 * the reader has to go back to the catalogue and work out which bottle was
 * meant. The list is curated per article in the admin CMS, so what it offers is
 * always what the text is about.
 *
 * Resolved against the storefront's own catalogue rather than built from the
 * junction's trimmed payload, so these cards carry the same imagery, badges and
 * copy as everywhere else. Empty when the API is unreachable — the strip is
 * conditional, not a hole in the layout.
 */
export async function getArticleProducts(
  slug: string,
): Promise<{ products: Product[]; note: string | null }> {
  const api = await tryFetch(() => getBlogPostBySlug(slug));
  const rows = [...(api?.products ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  if (!rows.length) return { products: [], note: null };

  const catalogue = await getProducts();
  const bySlug = new Map(catalogue.map((product) => [product.slug, product]));

  return {
    products: rows
      .map((row) => bySlug.get(row.product?.slug ?? ""))
      .filter((product): product is Product => product !== undefined),
    note: rows.find((row) => row.note)?.note ?? null,
  };
}
