/**
 * The customer's own account: signing in, the profile, and what they have
 * bought.
 *
 * One Numa account spans all three shops, so nothing here is scoped by store —
 * `/orders/my` and `/me/purchases` answer for every storefront at once and take
 * an optional filter instead.
 */

import { ApiError, api, writeSession, type SessionTokens } from "./axios";
import { ACCOUNT_TIMEOUT_MS } from "./config";
import type { ApiOrder, StoreSlug } from "./types";

/**
 * Same shape as the shared `request`, but on the account's longer budget.
 *
 * The shared helper carries the catalogue's 4s, which is right for a page that
 * can fall back to bundled copy and wrong here: verifying a code also adopts
 * guest orders and imports CRM history, and cutting that off at 4s reports a
 * connection failure for a request that was about to succeed.
 */
async function request<T>(
  method: "get" | "post" | "put",
  url: string,
  data?: unknown,
): Promise<T> {
  const response = await api.request<T>({
    method,
    url,
    data,
    timeout: ACCOUNT_TIMEOUT_MS,
  });
  return response.data;
}

/* ── profile ─────────────────────────────────────────────────────────────── */

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

/* ── sign-in ─────────────────────────────────────────────────────────────── */

/**
 * What the OTP step answers with.
 *
 * Swagger documents `{ userId, phone }` and a `404` for a number with no
 * account. The deployed API does neither: `/auth/login` answers `200` for every
 * well-formed number with "if this phone number is valid, an OTP has been
 * sent", so that nobody can use the form to discover who has an account. The
 * storefront therefore cannot branch on this response — which is why signing in
 * and registering are two explicit choices rather than one guessed flow, and
 * why "no such account" only surfaces at `/auth/verify-otp`.
 */
export interface OtpChallenge {
  message: string;
}

export interface VerifiedSession extends SessionTokens {
  user: UserProfile;
}

/** Sends a fresh code to a phone that already has an account. */
export const requestLoginOtp = (phone: string) =>
  request<OtpChallenge>("post", "/auth/login", { phone });

/** Creates the account and sends the first code. */
export const registerCustomer = (payload: {
  firstName: string;
  lastName?: string;
  phone: string;
}) => request<OtpChallenge>("post", "/auth/register", payload);

/**
 * Exchanges the code for a session and stores it.
 *
 * The backend also adopts any guest cart and any past guest orders placed with
 * this number, so there is nothing to merge on the storefront afterwards.
 */
export async function verifyOtp(phone: string, otp: string): Promise<UserProfile> {
  const session = await request<VerifiedSession>("post", "/auth/verify-otp", {
    phone,
    otp,
  });
  writeSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
  return session.user;
}

/**
 * Ends the session locally whatever the server says — a token the backend has
 * already forgotten still has to disappear from this browser.
 */
export async function logout(): Promise<void> {
  try {
    await request<null>("post", "/auth/logout");
  } catch {
    // Already expired or offline; the local clear below is what matters.
  } finally {
    writeSession(null);
  }
}

export const getProfile = () => request<UserProfile>("get", "/auth/me");

/** The phone is the account's identity and is fixed; only the name is editable. */
export const updateProfile = (payload: { firstName?: string; lastName?: string }) =>
  request<UserProfile>("put", "/auth/me", payload);

/* ── orders ──────────────────────────────────────────────────────────────── */

export interface MyOrdersPage {
  orders: ApiOrder[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const getMyOrders = (params: {
  store?: StoreSlug;
  page?: number;
  limit?: number;
} = {}) => {
  const query = new URLSearchParams();
  if (params.store) query.set("store", params.store);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const suffix = query.toString();
  return request<MyOrdersPage>("get", `/orders/my${suffix ? `?${suffix}` : ""}`);
};

/** Someone else's order answers 404 rather than 403, so ids cannot be probed. */
export const getMyOrder = (id: string) =>
  request<ApiOrder>("get", `/orders/my/${encodeURIComponent(id)}`);

/* ── purchase history ────────────────────────────────────────────────────── */

/**
 * `site` is an order placed here; `crm` is one a manager entered in Bitrix
 * before or outside the site. Only `site` rows carry a store and a status.
 */
export type PurchaseSource = "site" | "crm";

export interface PurchaseLine {
  name: string;
  price: number;
  quantity: number;
}

export interface Purchase {
  source: PurchaseSource;
  id: string;
  date: string;
  /** Sums, not tiyin — this one is not divided by 100. */
  amount: number;
  currency: string;
  items: PurchaseLine[];
  /** `site` only. */
  store?: StoreSlug;
  /** `site` only. */
  status?: ApiOrder["status"];
  /** `crm` only — the deal's name, since there is no order to link to. */
  title?: string;
}

export interface PurchaseHistory {
  /** Already newest-first; do not re-sort. */
  purchases: Purchase[];
  counts: { db: number; crm: number };
  /** When CRM history was last pulled in; null means never. */
  crmSyncedAt: string | null;
}

/**
 * Everything the customer has bought, from both sources, in one list.
 *
 * `/me/bitrix-history` exists but talks to the portal live and returns its raw
 * shape — it is a debugging aid, and everything it knows is already here.
 */
export const getPurchases = () => request<PurchaseHistory>("get", "/me/purchases");

/* ── errors ──────────────────────────────────────────────────────────────── */

export type AuthFailure =
  | "unregistered"
  | "alreadyRegistered"
  | "wrongCode"
  | "rateLimit"
  | "validation"
  | "network";

/**
 * Maps a failed sign-in step onto the message the form should show.
 *
 * `404` means different things either side of the code: asking for a code never
 * returns one (see `OtpChallenge`), so a `404` on verification is the first
 * moment the number is known to have no account.
 */
export function classifyAuthError(error: unknown, step: "request" | "verify"): AuthFailure {
  const status = error instanceof ApiError ? error.status : 0;
  if (status === 409) return "alreadyRegistered";
  if (status === 404) return step === "verify" ? "unregistered" : "network";
  if (status === 401) return "wrongCode";
  if (status === 429) return "rateLimit";
  if (status === 422) return "validation";
  return "network";
}
