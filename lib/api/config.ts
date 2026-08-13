/** Storefront ↔ backend wiring. */

/**
 * Absolute base of the Numa API, e.g. `https://api.numafamily.uz/api/v1`.
 * Left empty the storefront runs entirely on its bundled static catalogue,
 * which is exactly what a preview deploy without a backend should do.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "https://numa.yoldosh.uz/api/v1";

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

/**
 * localStorage key for the customer's token pair.
 *
 * Not scoped to the store: one Numa account covers every storefront, and each
 * site is its own origin anyway, so scoping would only log people out whenever
 * the slug changed.
 */
export const SESSION_STORAGE_KEY = "numa-session";

/**
 * Account calls get a longer budget than the catalogue.
 *
 * The 4s above exists because a slow catalogue can fall back to bundled copy.
 * The account has nothing to fall back on, and signing in does real work on the
 * way — it adopts guest orders and pulls the customer's CRM purchase history —
 * so a short budget turns a slow answer into a bogus "connection failed".
 */
export const ACCOUNT_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_ACCOUNT_TIMEOUT_MS ?? 20000,
);
