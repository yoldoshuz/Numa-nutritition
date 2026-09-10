import type { ApiProductBlock } from "@/lib/api/types";
import type { ProductImages } from "@/lib/product-images";

export type ProductBadge = "hit" | "new" | "rec";

export type ProductForm = "syrup" | "capsules" | "tablets" | "honey";

/**
 * Structural product data. Every user-facing string lives in `messages/*.json`
 * under the `Catalog.<slug>` namespace so the whole catalogue is localizable.
 */
export interface Product {
  /**
   * Backend UUID. Present only on products resolved from the API — the server
   * cart addresses items by id, so its absence is what tells the cart to fall
   * back to its local, offline mode.
   */
  id?: string;
  /** Units left in stock; `undefined` when serving the static catalogue. */
  stock?: number;
  /** URL segment and translation namespace key. */
  slug: string;
  /** Brand name — identical in every locale. */
  name: string;
  /** Price in UZS. */
  price: number;
  badge: ProductBadge;
  form: ProductForm;
  /** Packshot on a transparent background — the card and the cart read this. */
  image: string;
  /**
   * Every place a photograph can go on this product's page, keyed by the name
   * of the place.
   *
   * This is the whole of the page's photography. Each section asks for the slot
   * that carries its own name — `benefits` reads `benefits_1`/`benefits_2`,
   * `metrics` reads `metrics_1` — and an empty slot means that section renders
   * without a picture.
   *
   * It replaces `hero`, `gallery`, `usage`, `benefitSlides`, `ringImage` and
   * `statImage`. Those were positions in an unordered upload pile, so which
   * bottle appeared under "как принимать" was an accident of upload order, and
   * a product with one photograph had it printed into five frames.
   *
   * Absent on a catalogue list: the endpoint does not send it there, and a grid
   * of cards needs one photo each rather than fifteen.
   */
  images?: ProductImages;
  /** Rendered on the home page carousel. */
  featured: boolean;
  rating: number;
  reviewCount: number;
  /** Number of purpose cards / benefit checks / stat rows for this product. */
  statValues: number[];
  /**
   * Position in the catalogue grid, editable in the admin.
   *
   * The API answers in its own insertion order, which has nothing to do with
   * the merchandising sequence, so this is what decides the shelf.
   */
  order: number;
  /**
   * The product page's editable sections, authored in the admin — visible ones
   * only, in the order they should render.
   *
   * Only the by-slug response carries them, so this is present on a product
   * page and absent everywhere else. Absent (or empty) means the page falls
   * back to the copy bundled in `messages/`.
   */
  blocks?: ApiProductBlock[];
}

export interface CartLine {
  slug: string;
  quantity: number;
}

export interface CartLineWithProduct extends CartLine {
  product: Product;
}
