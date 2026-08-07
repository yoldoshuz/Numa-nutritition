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

import { apiFetch } from "./client";
import { CATALOG_REVALIDATE_SECONDS, STORE, isApiConfigured } from "./config";
import type {
  ApiBlogPost,
  ApiFeaturedList,
  ApiProduct,
  ApiProductList,
} from "./types";

/* ── mapping ─────────────────────────────────────────────────────────────── */

const mainMediaUrl = (api: ApiProduct): string | undefined =>
  (api.media ?? []).find((m) => m.isMain)?.url ?? (api.media ?? [])[0]?.url;

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
  const cardImage = images.card ?? mainMediaUrl(api) ?? base?.image ?? "";
  const gallery = images.gallery ?? base?.gallery ?? (api.media ?? []).map((m) => m.url);

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
    hero: images.hero ?? base?.hero ?? cardImage,
    gallery: gallery.length ? gallery : [cardImage],
    usage: images.usage ?? base?.usage ?? { small: [cardImage, cardImage], wide: cardImage },
    benefitSlides: images.benefitSlides ?? base?.benefitSlides ?? [cardImage],
    ringImage: images.ring ?? base?.ringImage ?? cardImage,
    statImage: images.stat ?? base?.statImage ?? cardImage,
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
    cover: api.coverImageUrl ?? base?.cover ?? "",
    figures: base?.figures ?? [],
    featured: base?.featured ?? false,
  };
}

/* ── fetchers ────────────────────────────────────────────────────────────── */

const revalidate = CATALOG_REVALIDATE_SECONDS;

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
  return tryFetch(async () => {
    const data = await apiFetch<ApiProductList>(
      `/products/store/${STORE}?limit=100&sortBy=createdAt&sortDir=asc`,
      { revalidate },
    );
    return data.products ?? [];
  });
}

export async function fetchApiBlogPosts(): Promise<ApiBlogPost[] | null> {
  return tryFetch(async () => {
    const data = await apiFetch<ApiBlogPost[] | { posts: ApiBlogPost[] }>(
      `/blog/${STORE}?limit=100`,
      { revalidate },
    );
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
  const api = await tryFetch(() =>
    apiFetch<ApiProduct>(`/products/${STORE}/${encodeURIComponent(slug)}`, { revalidate }),
  );
  return api ? toProduct(api) : getStaticProduct(slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const api = await tryFetch(async () => {
    // This endpoint returns Sequelize's `{ rows, count }` rather than the
    // paginated `{ products, total }` shape used by the list endpoint.
    const data = await apiFetch<ApiFeaturedList | ApiProduct[]>(
      `/products/featured/${STORE}`,
      { revalidate },
    );
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
  const api = await tryFetch(() =>
    apiFetch<ApiBlogPost>(`/blog/${STORE}/${encodeURIComponent(slug)}`, { revalidate }),
  );
  return api ? toBlogPost(api) : getStaticPost(slug);
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const all = await getBlogPosts();
  return all.filter((post) => post.slug !== slug).slice(0, limit);
}
