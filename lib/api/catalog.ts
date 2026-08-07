/**
 * The storefront's catalogue, resolved from the API with the bundled static
 * catalogue as a fallback.
 *
 * Every exported function answers with the storefront's own domain types, so
 * page components are identical in both modes. When the backend is unreachable
 * — unconfigured, down, slow, or serving garbage — the static data in
 * `lib/data/` takes over and the shop keeps working, minus live stock.
 */

import {
  blogPosts as staticBlogPosts,
  getPost as getStaticPost,
} from "@/lib/data/content";
import {
  getProduct as getStaticProduct,
  products as staticProducts,
} from "@/lib/data/products";
import type { BlogPost, Product, ProductBadge, ProductForm } from "@/types";

import {
  getBlogFeed,
  getBlogPostBySlug,
  getFeatured,
  getProductBySlug,
  getProductList,
} from "./endpoints";
import { isApiConfigured } from "./config";
import { resolveMediaUrl } from "./media";
import type { ApiBlogPost, ApiProduct } from "./types";

/* ── mapping ─────────────────────────────────────────────────────────────── */

const mainMediaUrl = (api: ApiProduct): string | undefined =>
  (api.media ?? []).find((m) => m.isMain)?.url ?? (api.media ?? [])[0]?.url;

const img = (url: string | null | undefined) => resolveMediaUrl(url);
const imgs = (urls: (string | null | undefined)[] | undefined) =>
  (urls ?? []).map(img).filter(Boolean);

/**
 * Folds an API product onto the storefront's `Product`.
 *
 * The seeded catalogue carries the storefront's own imagery and facets in
 * `attributes`, so this is normally a straight read. The static entry is
 * consulted only for fields a CMS-authored product would not have — which is
 * what keeps a hand-created product renderable instead of blank.
 */
function toProduct(api: ApiProduct): Product {
  const attrs = api.attributes ?? {};
  const images = attrs.images ?? {};
  const base = getStaticProduct(api.slug);
  const cardImage = img(images.card ?? mainMediaUrl(api)) || base?.image || "";
  const gallery = images.gallery
    ? imgs(images.gallery)
    : (base?.gallery ?? imgs((api.media ?? []).map((m) => m.url)));

  return {
    id: api.id,
    stock: api.stock,
    slug: api.slug,
    // Brand names are identical in every locale; `ru` is the seeded source.
    name: api.name?.ru || api.name?.en || base?.name || api.slug,
    price: Number(api.discountPrice ?? api.price),
    badge: (attrs.badge as ProductBadge) ?? base?.badge ?? "rec",
    form: (attrs.form as ProductForm) ?? base?.form ?? "capsules",
    image: cardImage,
    hero: img(images.hero) || base?.hero || cardImage,
    gallery: gallery.length ? gallery : [cardImage],
    usage: images.usage
      ? {
          small: [img(images.usage.small?.[0]), img(images.usage.small?.[1])] as [string, string],
          wide: img(images.usage.wide),
        }
      : (base?.usage ?? { small: [cardImage, cardImage], wide: cardImage }),
    benefitSlides: images.benefitSlides
      ? imgs(images.benefitSlides)
      : (base?.benefitSlides ?? [cardImage]),
    ringImage: img(images.ring) || base?.ringImage || cardImage,
    statImage: img(images.stat) || base?.statImage || cardImage,
    featured: api.isFeatured,
    rating: attrs.rating ?? base?.rating ?? 5,
    reviewCount: attrs.reviewCount ?? base?.reviewCount ?? 0,
    statValues: attrs.statValues ?? base?.statValues ?? [],
  };
}

function toBlogPost(api: ApiBlogPost): BlogPost {
  const base = getStaticPost(api.slug);
  return {
    slug: api.slug,
    category: (api.tags?.[0] ?? base?.category ?? "products") as BlogPost["category"],
    date: (api.publishedAt ?? base?.date ?? new Date().toISOString()).slice(0, 10),
    readingMinutes: api.readTimeMinutes ?? base?.readingMinutes ?? 5,
    cover: img(api.coverImageUrl) || base?.cover || "",
    figures: base?.figures ?? [],
    featured: base?.featured ?? false,
  };
}

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
