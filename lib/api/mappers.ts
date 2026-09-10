/**
 * Folds API entities onto the storefront's own domain types.
 *
 * Shared by the server, which renders the first paint, and by the React Query
 * hooks the browser uses to refetch, so a product looks identical whichever
 * side resolved it. The static entry is consulted only for fields a
 * CMS-authored record would not have, which keeps a hand-created product
 * renderable instead of blank.
 */

import { getPost as getStaticPost } from "@/lib/data/content";
import { getProduct as getStaticProduct } from "@/lib/data/products";
import {
  PRODUCT_IMAGE_SLOTS,
  toProductImages,
  type ProductImages,
} from "@/lib/product-images";
import type { BlogPost, Product, ProductBadge, ProductForm } from "@/types";

import { resolveMediaUrl } from "./media";
import type { ApiBlogPost, ApiProduct } from "./types";

/* ── mapping ─────────────────────────────────────────────────────────────── */

/**
 * The product's place in the catalogue grid.
 *
 * `sortOrder` is the backend's own column, set from the admin's arrows, and it
 * wins whenever it has been set. It starts at 0 for every product, so a
 * catalogue nobody has ordered by hand falls through to `attributes.order`
 * (where the position briefly lived) and then to the bundled catalogue, which
 * is the sequence this storefront shipped with.
 */
function resolveOrder(
  sortOrder: number | undefined,
  attributeOrder: unknown,
  bundled: number | undefined,
  fallback: number,
): number {
  if (typeof sortOrder === "number" && sortOrder > 0) return sortOrder;
  const legacy = Number(attributeOrder);
  if (Number.isFinite(legacy) && legacy > 0) return legacy;
  return bundled ?? fallback;
}

const img = (url: string | null | undefined) => resolveMediaUrl(url);

/**
 * Uploaded photos that must never reach the storefront, by product slug and
 * file name.
 *
 * A content review found two products showing photography that is not theirs.
 * Insulin Balance carried a frame of the pre-redesign 330 ml bottle and a shot
 * of three Hemoglobin+ bottles; Hemoglobin+ carried three frames of its own
 * discontinued blue bottle, while the product on sale is the purple 500 ml one.
 * Both sets are attached to the live records, so they arrive on every request.
 *
 * This is a stopgap, not the fix. The photos have to be deleted in the admin
 * (`DELETE /products/cms/:id/media/slot/:slot`); once they are, these entries
 * do nothing and should be dropped. Matching is on the file name rather than
 * the whole URL so moving the media origin does not quietly re-admit them.
 */
const REJECTED_SHOTS: Record<string, ReadonlySet<string>> = {
  "insulin-balance": new Set([
    "rectangle-1699-3.png", // discontinued 330 ml design
    "product-1786538186303-294374715.webp", // three Hemoglobin+ bottles on driftwood
  ]),
  hemoglobin: new Set([
    "rectangle-1699-2.png", // discontinued blue bottle
    "rectangle-118-7.png", // discontinued blue bottle
    "product-1786538559924-607669178.webp", // discontinued blue bottle
  ]),
};

const fileNameOf = (url: string): string => {
  const path = url.split(/[?#]/, 1)[0];
  return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1)).toLowerCase();
};

/**
 * Empties the slots holding a photo of the wrong product.
 *
 * A rejected file must not come back just because someone placed it in a slot,
 * and the answer is the same as for a slot nobody filled: the section renders
 * without a picture. Levelling it to `null` here rather than at each use site
 * means every reader — gallery, section, cover — agrees about what exists.
 */
function withoutRejected(slug: string, images: ProductImages): ProductImages {
  const rejected = REJECTED_SHOTS[slug];
  if (!rejected) return images;

  for (const slot of PRODUCT_IMAGE_SLOTS) {
    const image = images[slot];
    if (image && rejected.has(fileNameOf(image.url))) images[slot] = null;
  }
  return images;
}

/**
 * The one photo a card needs: the product's cover.
 *
 * The by-slug response answers with the full `images` map, but a catalogue list
 * does not — it carries `media` only — so a card resolves its cover from the
 * slot each file says it sits in. `gallery_1` is the documented cover; `isMain`
 * is the same fact spelled the old way and stands behind it; the first upload
 * is the last resort, for a record whose files predate slots entirely.
 *
 * This is the only place `media` is still read, and the only place `isMain` is
 * consulted. Nothing on a product page goes near either.
 */
function coverShot(api: ApiProduct): string {
  const rejected = REJECTED_SHOTS[api.slug];
  const photos = (api.media ?? [])
    .filter((m) => m.type !== "video")
    .filter((m) => !rejected?.has(fileNameOf(m.url ?? "")));

  const cover =
    api.images?.gallery_1?.url ??
    photos.find((m) => m.slot === "gallery_1")?.url ??
    photos.find((m) => m.isMain)?.url ??
    photos[0]?.url;

  return img(cover);
}

/**
 * Folds an API product onto the storefront's `Product`.
 *
 * Precedence for every field is live record → the bundled static entry →
 * seeded `attributes`, so whatever a moderator can edit is what the page shows
 * and the rest still has something to fall back on.
 *
 * Photography is the exception, and deliberately so. It comes from the live
 * record's named slots and from nowhere else: the page reads `images` and an
 * empty slot means that section has no picture. Falling back to the bundle here
 * is what put `/Asset 1 1-7.png` — a file King Bee happens to share with
 * nothing, standing in for four missing slots — across a page whose product has
 * exactly one photograph. The bundled artwork still answers for the offline
 * catalogue, which declares its own slots in `lib/data/products.ts`.
 */
export function toProduct(api: ApiProduct): Product {
  const attrs = api.attributes ?? {};
  const base = getStaticProduct(api.slug);

  const images = withoutRejected(api.slug, toProductImages(api.images));
  const cardImage = coverShot(api) || base?.image || "";

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
    /*
     * Empty on a list, which is correct: the endpoint does not send `images`
     * there and every section that reads a slot lives on the product page.
     */
    images,
    featured: api.isFeatured,
    rating: attrs.rating ?? base?.rating ?? 5,
    reviewCount: attrs.reviewCount ?? base?.reviewCount ?? 0,
    statValues: attrs.statValues ?? base?.statValues ?? [],
    order: resolveOrder(api.sortOrder, attrs.order, base?.order, 0),
    // Only the by-slug response carries these, so on a list they are simply
    // absent — the catalogue has no use for them and they would bloat the
    // response.
    blocks: api.blocks?.length
      ? [...api.blocks].sort((a, b) => a.position - b.position)
      : undefined,
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
