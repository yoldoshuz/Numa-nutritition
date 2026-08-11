/** Every call the storefront makes, in one place. Transport only — no mapping. */

import { request } from "./axios";
import { STORE } from "./config";
import type {
  ApiBlogPost,
  ApiCart,
  ApiCheckoutResult,
  ApiFeaturedList,
  ApiOrderStatus,
  ApiPaymentUrl,
  ApiProduct,
  ApiProductList,
  CheckoutPayload,
  PaymentMethod,
} from "./types";

/* ── catalogue ───────────────────────────────────────────────────────────── */

export const getProductList = () =>
  request<ApiProductList>(
    "get",
    `/products/store/${STORE}?limit=100&sortBy=createdAt&sortDir=asc`,
  );

export const getProductBySlug = (slug: string) =>
  request<ApiProduct>("get", `/products/${STORE}/${encodeURIComponent(slug)}`);

/**
 * Answers with Sequelize's `{ rows, count }` rather than the paginated
 * `{ products, total }` shape the list endpoint uses — the two genuinely differ.
 */
export const getFeatured = () =>
  request<ApiFeaturedList | ApiProduct[]>("get", `/products/featured/${STORE}`);

export const getBlogFeed = () =>
  request<ApiBlogPost[] | { posts: ApiBlogPost[] }>("get", `/blog/${STORE}?limit=100`);

export const getBlogPostBySlug = (slug: string) =>
  request<ApiBlogPost>("get", `/blog/${STORE}/${encodeURIComponent(slug)}`);

/* ── cart ────────────────────────────────────────────────────────────────── */

export const getCart = () => request<ApiCart>("get", `/cart/${STORE}`);

export const postCartItem = (productId: string, quantity: number) =>
  request<ApiCart>("post", `/cart/${STORE}/items`, { productId, quantity });

export const patchCartItem = (productId: string, quantity: number) =>
  request<ApiCart>("patch", `/cart/${STORE}/items/${productId}`, { quantity });

export const deleteCartItem = (productId: string) =>
  request<ApiCart>("delete", `/cart/${STORE}/items/${productId}`);

export const deleteCart = () => request<null>("delete", `/cart/${STORE}`);

/* ── checkout & payment ──────────────────────────────────────────────────── */

export const postCheckout = (payload: CheckoutPayload) =>
  request<ApiCheckoutResult>("post", `/orders/${STORE}/checkout`, payload);

/**
 * Uzum is the Merchant-API dynamic QR: the hosted card page ("Uzum Checkout")
 * is not provisioned for this merchant and its routes are commented out in the
 * backend router.
 */
const CHECKOUT_URL_PATH: Record<Exclude<PaymentMethod, "cash">, string> = {
  click: "/payment/click/checkout-url",
  payme: "/payment/payme/checkout-url",
  uzum: "/payment/uzum/merchant/checkout-url",
};

export const getPaymentUrl = (orderId: string, method: Exclude<PaymentMethod, "cash">) =>
  request<ApiPaymentUrl>(
    "get",
    `${CHECKOUT_URL_PATH[method]}?orderId=${encodeURIComponent(orderId)}`,
  );

/**
 * The order's real state, straight from the record the provider callback
 * writes. This is what the return page must ask — the redirect that brought
 * the customer back carries no proof of payment.
 */
export const getOrderStatus = (orderId: string) =>
  request<ApiOrderStatus>(
    "get",
    `/orders/${STORE}/${encodeURIComponent(orderId)}/status`,
  );
