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
  return api.map(toProduct);
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
