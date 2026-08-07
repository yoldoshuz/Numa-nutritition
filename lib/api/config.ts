/** Storefront ↔ backend wiring. */

/**
 * Absolute base of the Numa API, e.g. `https://api.numafamily.uz/api/v1`.
 * Left empty the storefront runs entirely on its bundled static catalogue,
 * which is exactly what a preview deploy without a backend should do.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

/** This storefront's tenant in the multi-store backend. */
export const STORE = "nutrition" as const;

/**
 * A page must never hang because the API is slow — it has a complete static
 * fallback one `catch` away, so we give up early and render that instead.
 */
export const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 4000);

/** Seconds the catalogue may be served from Next's data cache. */
export const CATALOG_REVALIDATE_SECONDS = Number(
  process.env.NEXT_PUBLIC_CATALOG_REVALIDATE ?? 300,
);

export const isApiConfigured = (): boolean => API_BASE_URL.length > 0;

/** localStorage key mirroring the backend's `X-Cart-Token`. */
export const CART_TOKEN_STORAGE_KEY = `numa-cart-token:${STORE}`;
