/**
 * Folds API entities onto the storefront's own domain types.
 *
 * Shared by the server, which renders the first paint, and by the React Query
 * hooks the browser uses to refetch, so a product looks identical whichever
 * side resolved it. The static entry is consulted only for fields a
 * CMS-authored record would not have, which keeps a hand-created product
 * renderable instead of blank.
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

import { resolveMediaUrl } from "./media";
import type { ApiBlogPost, ApiProduct } from "./types";

/* ── mapping ─────────────────────────────────────────────────────────────── */

const img = (url: string | null | undefined) => resolveMediaUrl(url);
const imgs = (urls: (string | null | undefined)[] | undefined) =>
  (urls ?? []).map(img).filter(Boolean);

/**
 * The photos uploaded through the admin, the one marked main first and the rest
 * in their sort order.
 *
 * These outrank `attributes.images` on purpose. `attributes` is seed data that
 * no admin screen writes to, so as long as it won, a moderator could replace a
 * product's whole photo set and watch the storefront ignore every one of them —
 * and some of those seeded URLs have since rotted to 404s, which is how the
 * flagship product ended up rendering a broken card image.
 */
function uploadedShots(api: ApiProduct): string[] {
  return [...(api.media ?? [])]
    .filter((m) => m.type !== "video")
    .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder)
    .map((m) => img(m.url))
    .filter(Boolean);
}

/**
 * Folds an API product onto the storefront's `Product`.
 *
 * Precedence for every field is live record → seeded `attributes` → the bundled
 * static entry, so whatever a moderator can edit is what the page shows and the
 * rest still has something to fall back on.
 */
export function toProduct(api: ApiProduct): Product {
  const attrs = api.attributes ?? {};
  const images = attrs.images ?? {};
  const base = getStaticProduct(api.slug);

  const shots = uploadedShots(api);
  /** Nth uploaded photo, wrapping — a set smaller than the layout still fills it. */
  const shot = (index: number): string | undefined =>
    shots.length ? shots[index % shots.length] : undefined;

  const cardImage = shot(0) || img(images.card) || base?.image || "";
  const gallery = shots.length
    ? shots
    : images.gallery
      ? imgs(images.gallery)
      : (base?.gallery ?? []);

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
    hero: shot(1) || img(images.hero) || base?.hero || cardImage,
    gallery: gallery.length ? gallery : [cardImage],
    usage:
      shots.length >= 3
        ? { small: [shot(2)!, shot(3)!] as [string, string], wide: shot(4)! }
        : images.usage
          ? {
              small: [img(images.usage.small?.[0]), img(images.usage.small?.[1])] as [
                string,
                string,
              ],
              wide: img(images.usage.wide),
            }
          : (base?.usage ?? { small: [cardImage, cardImage], wide: cardImage }),
    benefitSlides: shots.length
      ? shots
      : images.benefitSlides
        ? imgs(images.benefitSlides)
        : (base?.benefitSlides ?? [cardImage]),
    ringImage: shot(0) || img(images.ring) || base?.ringImage || cardImage,
    statImage: shot(1) || img(images.stat) || base?.statImage || cardImage,
    featured: api.isFeatured,
    rating: attrs.rating ?? base?.rating ?? 5,
    reviewCount: attrs.reviewCount ?? base?.reviewCount ?? 0,
    statValues: attrs.statValues ?? base?.statValues ?? [],
  };
}

export function toBlogPost(api: ApiBlogPost): BlogPost {
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

