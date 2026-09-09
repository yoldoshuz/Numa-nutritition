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
import type { BlogPost, Product, ProductBadge, ProductForm } from "@/types";

import { resolveMediaUrl } from "./media";
import type { ApiBlogPost, ApiProduct, ImageSlotKey } from "./types";

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
const imgs = (urls: (string | null | undefined)[] | undefined) =>
  (urls ?? []).map(img).filter(Boolean);

/**
 * Uploaded photos that must never reach the storefront, by product slug and
 * file name.
 *
 * A content review found two products showing photography that is not theirs.
 * Insulin Balance carried a frame of the pre-redesign 330 ml bottle and a shot
 * of three Hemoglobin+ bottles; Hemoglobin+ carried three frames of its own
 * discontinued blue bottle, while the product on sale is the purple 500 ml one.
 * Both sets are attached to the live records, so they arrive on every request
 * and outrank everything the storefront bundles.
 *
 * This is a stopgap, not the fix. The photos have to be deleted in the admin
 * (`DELETE /products/cms/:id/media/:mediaId`); once they are, these entries do
 * nothing and should be dropped. Matching is on the file name rather than the
 * whole URL so moving the media origin does not quietly re-admit them.
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
  const rejected = REJECTED_SHOTS[api.slug];

  return [...(api.media ?? [])]
    .filter((m) => m.type !== "video")
    .filter((m) => !rejected?.has(fileNameOf(m.url ?? "")))
    .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder)
    .map((m) => img(m.url))
    .filter(Boolean);
}

/** The four gallery places, in the order the design stacks them. */
const GALLERY_SLOTS: ImageSlotKey[] = ["gallery_1", "gallery_2", "gallery_3", "gallery_4"];

/**
 * Reads the pictures a moderator placed by hand, one named place at a time.
 *
 * This is what replaces guessing. Every block on the detail page used to be
 * dressed from the same unordered upload pile — nth photo, wrapping — so which
 * bottle appeared under "how to take" was an accident of upload order. Now each
 * block asks for the frame that was placed in its own slot, and the pile is only
 * consulted when nobody has placed anything.
 *
 * Rejected file names are honoured here too: a photo pulled for showing the
 * wrong product must not come back just because it sits in a slot.
 */
function slotReader(api: ApiProduct) {
  const rejected = REJECTED_SHOTS[api.slug];

  return (slot: ImageSlotKey): string | undefined => {
    const url = api.images?.[slot]?.url;
    if (!url || rejected?.has(fileNameOf(url))) return undefined;
    return img(url) || undefined;
  };
}

/**
 * Folds an API product onto the storefront's `Product`.
 *
 * Precedence for every field is live record → the bundled static entry →
 * seeded `attributes`, so whatever a moderator can edit is what the page shows
 * and the rest still has something to fall back on.
 *
 * Imagery is why the static entry outranks `attributes`. The seeded URLs point
 * at the originals the catalogue was built from — one of them a 10 MB PNG of a
 * single bottle — and the image optimizer gives up fetching those after seven
 * seconds and answers 500, which is how several cards ended up rendering a
 * broken-image box. The bundled copies are the same artwork at web weight and
 * are served off this deployment, so they cannot time out. Uploaded media still
 * wins over both: that is the one set a moderator controls.
 */
export function toProduct(api: ApiProduct): Product {
  const attrs = api.attributes ?? {};
  const images = attrs.images ?? {};
  const base = getStaticProduct(api.slug);

  const slot = slotReader(api);

  /*
   * The four gallery places win over the upload pile outright.
   *
   * Slots arrived after the catalogue was already full, so a product nobody has
   * re-uploaded since has `images` empty and `media` full; reading only the
   * slots would blank out its card. But the moment one gallery slot is filled,
   * that placement is a deliberate choice and the pile stops being consulted —
   * including for the places left empty, which is why the list is compacted
   * rather than padded.
   */
  const placed = GALLERY_SLOTS.map(slot).filter((url): url is string => Boolean(url));
  const shots = placed.length ? placed : uploadedShots(api);

  /*
   * The uploads drive the detail page's composition only when there are enough
   * of them to fill it.
   *
   * The blocks below want five distinct photos between them. Wrapping a shorter
   * set round to fill the slots put the same bottle in three boxes on one
   * screen, and after a review pulled the wrong photos off Hemoglobin+ it would
   * have left that page with a single packshot repeated down the whole page
   * while four correct ones sat in the bundle unused. Three is the same
   * threshold `usage` has always applied; it now governs the gallery and the
   * benefits carousel too, so a product is dressed from one source rather than
   * half from each.
   *
   * The card image is exempt: it is one slot, and one upload fills it.
   */
  const composed = shots.length >= 3 ? shots : [];
  /** Nth photo of the composition set, wrapping. */
  const shot = (index: number): string | undefined =>
    composed.length ? composed[index % composed.length] : undefined;

  const cardImage = shots[0] || base?.image || img(images.card) || "";
  /*
   * First slide of the detail gallery — `product-gallery` renders
   * `[hero, ...gallery]` deduped, so this is what the visitor sees first.
   *
   * With a placed gallery that has to be `gallery_1`: it is the slot documented
   * as the main photo, the one the card and the cart show, and leading the
   * slider with anything else would open the page on a picture the visitor did
   * not click. Without one it stays the second upload, because the card already
   * spent the first and repeating it put the same bottle in both frames.
   */
  const hero = placed[0] || shot(1) || base?.hero || img(images.hero) || cardImage;
  /*
   * A placed gallery skips the three-photo threshold below.
   *
   * That rule guards against dressing five blocks from two uploads. It has no
   * business here: a moderator who filled `gallery_1` and nothing else asked for
   * exactly one thumbnail, and falling back to the bundled set would overrule
   * them with artwork they had just replaced.
   */
  const gallery = placed.length
    ? placed
    : composed.length
      ? composed
      : base?.gallery?.length
        ? base.gallery
        : imgs(images.gallery);

  /*
   * What the "how to take" block showed before slots existed: two arbitrary
   * photos from the pile, or the bundled set. Kept as the floor under the
   * placed pictures, so a half-filled product still renders a full block.
   */
  const legacyUsage =
    composed.length
      ? { small: [shot(2)!, shot(3)!] as [string, string], wide: shot(4)! }
      : (base?.usage ??
        (images.usage
          ? {
              small: [img(images.usage.small?.[0]), img(images.usage.small?.[1])] as [
                string,
                string,
              ],
              wide: img(images.usage.wide),
            }
          : { small: [cardImage, cardImage], wide: cardImage }));

  const placedBenefits = [slot("benefits_1"), slot("benefits_2")].filter(
    (url): url is string => Boolean(url),
  );

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
    hero,
    /*
     * Left empty when the product has no second photo. It used to fall back to
     * the card image, which put a thumbnail of the picture already filling the
     * frame above it directly underneath — and since the bundled copy and the
     * uploaded original are different URLs of the same artwork, the gallery had
     * no way to notice and drop it.
     */
    gallery,
    /*
     * Each box takes the slot cut for it: the instructions photo, the lifestyle
     * frame beside it, and the wide strip underneath. `advantages_1` backs
     * `banner_wide` because both are the same shape and either one is a better
     * answer than a portrait jar letterboxed across a 1200×415 panel.
     */
    usage: {
      small: [
        slot("how_to_use_1") || legacyUsage.small[0],
        slot("lifestyle_1") || legacyUsage.small[1],
      ] as [string, string],
      wide: slot("banner_wide") || slot("advantages_1") || legacyUsage.wide,
    },
    benefitSlides: placedBenefits.length
      ? placedBenefits
      : composed.length
        ? composed
        : base?.benefitSlides?.length
          ? base.benefitSlides
          : (imgs(images.benefitSlides).length ? imgs(images.benefitSlides) : [cardImage]),
    ringImage:
      slot("composition_1") || shots[0] || base?.ringImage || img(images.ring) || cardImage,
    statImage: slot("metrics_1") || shot(1) || base?.statImage || img(images.stat) || cardImage,
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

