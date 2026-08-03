export type ProductBadge = "hit" | "new" | "rec";

export type ProductForm = "syrup" | "capsules" | "tablets" | "honey";

/**
 * Structural product data. Every user-facing string lives in `messages/*.json`
 * under the `Catalog.<slug>` namespace so the whole catalogue is localizable.
 */
export interface Product {
  /** URL segment and translation namespace key. */
  slug: string;
  /** Brand name — identical in every locale. */
  name: string;
  /** Price in UZS. */
  price: number;
  badge: ProductBadge;
  form: ProductForm;
  /** Packshot on a transparent background. */
  image: string;
  /** Large image shown in the detail gallery. */
  hero: string;
  /** Thumbnails under the gallery hero (front / back / lifestyle). */
  gallery: string[];
  /** Two portrait shots + one wide shot used by the "how to take" block. */
  usage: { small: [string, string]; wide: string };
  /** Slides of the benefits carousel. */
  benefitSlides: string[];
  /** Bottle centred inside the highlights ring. */
  ringImage: string;
  /** Product trio inside the mint circle next to the stat bars. */
  statImage: string;
  /** Rendered on the home page carousel. */
  featured: boolean;
  rating: number;
  reviewCount: number;
  /** Number of purpose cards / benefit checks / stat rows for this product. */
  statValues: number[];
}

export interface CartLine {
  slug: string;
  quantity: number;
}

export interface CartLineWithProduct extends CartLine {
  product: Product;
}
