/** Shapes returned by the Numa backend (`/api/v1`). */

import type { AppLocale } from "@/lib/i18n/routing";

/** Every backend string field is a `{uz, ru, en}` map. */
export type I18nText = Record<AppLocale, string>;

/** Rich article bodies and product copy keep their structure per locale. */
export type I18nRich<T> = Record<AppLocale, T>;

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
}

/* ── cart / checkout ─────────────────────────────────────────────────────── */

export interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: ApiProduct;
  isAvailable: boolean;
}

export interface ApiCart {
  id: string;
  store: string;
  userId: string | null;
  sessionToken: string | null;
  items: ApiCartItem[];
}

export type PaymentMethod = "cash" | "click" | "payme" | "uzum";
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
