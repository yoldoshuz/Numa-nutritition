/** Shapes returned by the Numa backend (`/api/v1`). */

import type { AppLocale } from "@/lib/i18n/routing";

/** Every backend string field is a `{uz, ru, en}` map. */
export type I18nText = Record<AppLocale, string>;

/** Rich article bodies and product copy keep their structure per locale. */
export type I18nRich<T> = Record<AppLocale, T>;

/**
 * The tenants of the shared backend. One customer account spans all of them, so
 * the account screens legitimately show orders from stores this storefront does
 * not itself sell.
 */
export type StoreSlug = "nutrition" | "kids" | "halal" | "family";

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: unknown;
}

export interface ApiMedia {
  id: string;
  url: string;
  type: "image" | "video";
  isMain: boolean;
  sortOrder: number;
}

export interface ApiCategory {
  id: string;
  name: I18nText;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

/**
 * `attributes` is free-form JSONB. The seeded catalogue puts the storefront's
 * own structural data there, so a product round-trips through the API without
 * losing anything the existing page components need.
 */
export interface ApiProductAttributes {
  form?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  statValues?: number[];
  images?: {
    card?: string;
    hero?: string;
    gallery?: string[];
    usage?: { small: [string, string]; wide: string };
    benefitSlides?: string[];
    ring?: string;
    stat?: string;
  };
  /** Per-locale product copy, mirroring `messages.Product.<slug>`. */
  content?: I18nRich<Record<string, unknown>>;
}

export interface ApiProduct {
  id: string;
  name: I18nText;
  description: I18nText | null;
  slug: string;
  sku: string;
  price: string | number;
  discountPrice: string | number | null;
  stock: number;
  unit: string;
  store: string;
  categoryId: string;
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  brand: string | null;
  attributes: ApiProductAttributes;
  media?: ApiMedia[];
  category?: Pick<ApiCategory, "id" | "name" | "slug">;
}

/** `/products/store/:store` — paginated. */
export interface ApiProductList {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * `/products/featured/:store` answers with Sequelize's raw `findAndCountAll`
 * shape rather than the paginated one above — the two endpoints genuinely
 * differ, so both are normalized in `catalog.ts`.
 */
export interface ApiFeaturedList {
  rows: ApiProduct[];
  count: number;
}

export interface ApiBlogPost {
  id: string;
  title: I18nText;
  /**
   * Seeded posts carry the storefront's structured article body (lead,
   * sections, cards…). Posts authored later in the admin CMS carry a plain
   * string. Both shapes reach the storefront and are handled by the renderer.
   */
  content: I18nRich<Record<string, unknown> | string>;
  excerpt: I18nText | null;
  slug: string;
  coverImageUrl: string | null;
  store: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  tags: string[];
  readTimeMinutes: number | null;
  viewCount: number;
  /**
   * Products the article recommends, curated in the admin CMS
   * (`blog_post_products`). Carried by the by-slug response only — the feed
   * omits it.
   */
  products?: ApiBlogPostProduct[];
}

/** One row of the blog ↔ product junction. Only the slug and note are used. */
export interface ApiBlogPostProduct {
  productId: string;
  /** The editor's line, carried by the lead product only. */
  note: string | null;
  sortOrder: number;
  product: { id: string; slug: string };
}

/* ── cart / checkout ─────────────────────────────────────────────────────── */

/**
 * Money for the whole cart, computed server-side.
 *
 * The storefront used to sum the basket itself, which drifted from what the
 * customer was actually charged: the reduce ran on floats and reached for
 * `product.price` rather than the discounted one. These come off the same
 * code path that prices the order, in whole tiyin, so `total` is by
 * construction the `totalAmount` checkout will create.
 */
export interface ApiCartTotals {
  /** Amount due, UZS. */
  total: number;
  /** The same amount in whole tiyin (1 UZS = 100 tiyin), for exact compares. */
  totalTiyin: number;
  /** Sum of the unavailable lines. Deliberately NOT part of `total`. */
  unavailableTotal: number;
  /** Number of lines in the cart, unavailable ones included. */
  itemsCount: number;
  /** Units across the available lines only. */
  totalQuantity: number;
  /** Delivery, UZS. 50 000 for a single-unit order, 0 from two units up. */
  deliveryFee: number;
  /** The same amount in whole tiyin. */
  deliveryFeeTiyin: number;
  /** `total` + `deliveryFee` — the figure the order will actually charge. */
  grandTotal: number;
  /** The same amount in whole tiyin. */
  grandTotalTiyin: number;
}

export interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: ApiProduct;
  isAvailable: boolean;
  /** Price this line will actually go into the order at (discountPrice ?? price). */
  unitPrice: number | null;
  /** unitPrice × quantity. */
  lineTotal: number | null;
}

export interface ApiCart {
  id: string;
  store: string;
  userId: string | null;
  sessionToken: string | null;
  items: ApiCartItem[];
  /** Always present, including for a cart that does not exist yet. */
  totals: ApiCartTotals;
}

/** `status` on an order, as returned by GET /orders/:store/:id/status. */
export type OrderLifecycle = "new" | "processing" | "completed" | "cancelled";

export type OrderPaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

/**
 * The only trustworthy answer to "did the customer pay".
 *
 * A provider redirect proves nothing — the shopper who paid, the shopper whose
 * card was declined and the shopper who hit back all land on the same return
 * URL. Payment is confirmed by the provider's server-to-server callback, and
 * this endpoint reports what that callback established.
 */
export interface ApiOrderStatus {
  orderId: string;
  store: string;
  status: OrderLifecycle;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod | null;
  totalAmount: number;
  /** Money confirmed by the callback. */
  isPaid: boolean;
  /** Callback has not arrived yet — poll again before deciding anything. */
  isAwaitingPayment: boolean;
  /** Payment did not happen and the order was rolled back. */
  isFailed: boolean;
  /** Always false: a rolled-back order releases its stock and cannot be repaid. */
  canRetryPayment: boolean;
  /** The rolled-back lines are back in the cart. */
  cartRestored: boolean;
  reservedUntil: string | null;
  createdAt: string;
}

/** Every method an order may carry, including ones no longer offered. */
export type PaymentMethod = "cash" | "click" | "payme" | "uzum";

/**
 * What checkout may offer today.
 *
 * Payme is deliberately absent, and Uzum has no Merchant API keys — offering
 * either would hand the customer a dead redirect. Orders placed earlier keep
 * whatever method they were paid with, which is why `PaymentMethod` above stays
 * wider than this.
 */
export type OfferedPaymentMethod = "cash" | "click";
export type DeliveryType = "delivery" | "pickup";

export interface CheckoutPayload {
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryType?: DeliveryType;
  notes?: string | null;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
}

export interface ApiOrderItem {
  productId: string;
  productName: I18nText;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface ApiOrder {
  id: string;
  store: string;
  userId: string | null;
  status: "new" | "processing" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "pending" | "paid" | "failed" | "expired" | "refunded";
  paymentMethod: PaymentMethod;
  totalAmount: string;
  items: ApiOrderItem[];
  reservedUntil: string | null;
  createdAt: string;
}

export interface ApiCheckoutResult {
  order: ApiOrder;
  /** Always null — the payment URL is fetched separately, per provider. */
  paymentUrl: string | null;
}

export interface ApiPaymentUrl {
  url: string;
  orderId: string;
  amountUzs?: number;
  amountTiyin?: number;
}
