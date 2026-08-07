/** Server-cart operations for this storefront's tenant. */

import { apiFetch } from "./client";
import { STORE } from "./config";
import type {
  ApiCart,
  ApiCheckoutResult,
  ApiPaymentUrl,
  CheckoutPayload,
  PaymentMethod,
} from "./types";

/**
 * Guest carts are keyed by a token the backend issues on first write. It is
 * mirrored into localStorage and replayed via `X-Cart-Token` rather than relying
 * on the `cart_session_*` cookie, which a browser blocking third-party cookies
 * would drop on a cross-origin storefront.
 */
const cartRequest = <T>(path: string, init?: Parameters<typeof apiFetch>[1]) =>
  apiFetch<T>(path, { ...init, withCartToken: true });

export const fetchCart = () => cartRequest<ApiCart>(`/cart/${STORE}`);

export const addCartItem = (productId: string, quantity = 1) =>
  cartRequest<ApiCart>(`/cart/${STORE}/items`, {
    method: "POST",
    body: { productId, quantity },
  });

export const setCartItemQuantity = (productId: string, quantity: number) =>
  cartRequest<ApiCart>(`/cart/${STORE}/items/${productId}`, {
    method: "PATCH",
    body: { quantity },
  });

export const removeCartItem = (productId: string) =>
  cartRequest<ApiCart>(`/cart/${STORE}/items/${productId}`, { method: "DELETE" });

export const clearCart = () =>
  cartRequest<null>(`/cart/${STORE}`, { method: "DELETE" });

/* ── checkout ────────────────────────────────────────────────────────────── */

export const checkout = (payload: CheckoutPayload) =>
  cartRequest<ApiCheckoutResult>(`/orders/${STORE}/checkout`, {
    method: "POST",
    body: payload,
  });

/** Provider → checkout-url path. Uzum is the Merchant-API dynamic QR: the
 *  hosted card page ("Uzum Checkout") is not provisioned for this merchant and
 *  its routes are commented out in the backend router. */
const CHECKOUT_URL_PATH: Record<Exclude<PaymentMethod, "cash">, string> = {
  click: "/payment/click/checkout-url",
  payme: "/payment/payme/checkout-url",
  uzum: "/payment/uzum/merchant/checkout-url",
};

/**
 * Hosted-checkout redirect for an online payment method. The order must already
 * exist — `checkout()` always answers with `paymentUrl: null` by design.
 *
 * The cart token is required: these endpoints sit behind `optionalAuth`, and a
 * guest proves ownership of the order with the very cart session it was created
 * from. That is why the token outlives checkout instead of being cleared with
 * the cart.
 */
export const fetchPaymentUrl = (
  orderId: string,
  method: Exclude<PaymentMethod, "cash">,
) =>
  cartRequest<ApiPaymentUrl>(
    `${CHECKOUT_URL_PATH[method]}?orderId=${encodeURIComponent(orderId)}`,
  );
