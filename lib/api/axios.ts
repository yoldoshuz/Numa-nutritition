import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  CART_TOKEN_STORAGE_KEY,
  isApiConfigured,
} from "./config";
import type { ApiEnvelope } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ── guest cart token ────────────────────────────────────────────────────── */

/**
 * The cart token lives in localStorage and travels as `X-Cart-Token` rather
 * than the `cart_session_*` cookie, which a browser blocking third-party
 * cookies would drop on a cross-origin storefront. It deliberately outlives
 * checkout: it is what proves a guest owns the order when asking for a payment
 * URL.
 */
export function readCartToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CART_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeCartToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(CART_TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(CART_TOKEN_STORAGE_KEY);
  } catch {
    // Private mode — the session still works for as long as the tab is open.
  }
}

/* ── instance ────────────────────────────────────────────────────────────── */

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isApiConfigured()) {
    // Fail before hitting the network so callers take the static-fallback path.
    return Promise.reject(new ApiError("API is not configured", 0)) as never;
  }
  const token = readCartToken();
  if (token) config.headers.set("X-Cart-Token", token);
  return config;
});

/** Pulls the guest cart token out of a cart response body. */
function tokenFromBody(payload: unknown): string | null {
  const data = (payload as { data?: { sessionToken?: unknown } } | undefined)?.data;
  const token = data?.sessionToken;
  return typeof token === "string" && token ? token : null;
}

api.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => {
    const payload = response.data;

    // The guest cart token arrives two ways and we take whichever we can get.
    //
    // The `X-Cart-Token` response header is the documented channel, but a
    // cross-origin browser only sees it when the server names it in
    // `Access-Control-Expose-Headers`, and any proxy or CDN in front of the API
    // can drop it. When that happens the token is never persisted, every
    // request opens a brand new cart, and the basket looks like it silently
    // refuses to hold anything — which is exactly the bug this replaces.
    //
    // The body is not subject to any of that: every cart response already
    // carries `sessionToken`, so it is the reliable source and the header is
    // just a faster one.
    const issued = response.headers["x-cart-token"];
    if (typeof issued === "string" && issued) writeCartToken(issued);
    else {
      const fromBody = tokenFromBody(payload);
      if (fromBody) writeCartToken(fromBody);
    }

    if (!payload?.success) {
      throw new ApiError(payload?.message ?? "Request failed", response.status, payload?.errors);
    }
    // Unwrap `{ success, data }` so callers only ever see the payload.
    response.data = payload.data as never;
    return response;
  },
  (error: unknown) => {
    if (error instanceof ApiError) throw error;

    if (error instanceof AxiosError) {
      const envelope = error.response?.data as ApiEnvelope<unknown> | undefined;
      const status =
        error.response?.status ?? (error.code === "ECONNABORTED" ? 408 : 0);
      throw new ApiError(envelope?.message ?? error.message, status, envelope?.errors);
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0);
  },
);

/** Thin helper so endpoint functions read as `request<T>("get", path)`. */
export async function request<T>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  data?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const response = await api.request<T>({ method, url, data, headers });
  return response.data;
}
