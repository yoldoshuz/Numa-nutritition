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
  SESSION_STORAGE_KEY,
  isApiConfigured,
} from "./config";
import type { ApiEnvelope } from "./types";

/** Marks a request that has already spent its one refresh-and-replay attempt. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

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

/* ── customer session ────────────────────────────────────────────────────── */

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Anyone who needs to react to the session ending — the auth context clears the
 * signed-in user, and account screens fall back to the login prompt. A plain
 * listener set rather than an event on `window`, so it also fires for a refresh
 * that failed inside an interceptor.
 */
type SessionListener = (tokens: SessionTokens | null) => void;
const sessionListeners = new Set<SessionListener>();

export function onSessionChange(listener: SessionListener): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function readSession(): SessionTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionTokens>;
    return parsed.accessToken && parsed.refreshToken
      ? { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken }
      : null;
  } catch {
    return null;
  }
}

export function writeSession(tokens: SessionTokens | null): void {
  if (typeof window !== "undefined") {
    try {
      if (tokens) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(tokens));
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Private mode — the session lasts as long as the tab does.
    }
  }
  for (const listener of sessionListeners) listener(tokens);
}

/** Paths where a 401 is the answer, not a stale token worth refreshing. */
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/verify-otp", "/auth/refresh"];

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

  // The cart token stays on regardless: a signed-in customer can still be
  // carrying a guest basket that checkout is about to claim.
  const session = readSession();
  if (session && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  return config;
});

/**
 * Swaps the refresh token for a new pair.
 *
 * Deliberately a bare axios call: routing it through `api` would re-enter the
 * interceptor below and, on a refresh token the server has also rejected, spin.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const session = readSession();
  if (!session) return null;

  try {
    const { data } = await axios.post<ApiEnvelope<SessionTokens>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: session.refreshToken },
      { timeout: API_TIMEOUT_MS, headers: { "Content-Type": "application/json" } },
    );
    if (!data?.success || !data.data?.accessToken) {
      writeSession(null);
      return null;
    }
    writeSession(data.data);
    return data.data.accessToken;
  } catch {
    writeSession(null);
    return null;
  }
}

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
  async (error: unknown) => {
    if (error instanceof ApiError) throw error;

    // An expired access token is recoverable exactly once per request: refresh,
    // replay, and only then let the failure through. Concurrent calls share the
    // one refresh so a page opening three account queries does not burn three
    // refresh tokens.
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      error.config &&
      !(error.config as RetriableConfig)._retried &&
      !AUTH_PATHS.some((path) => error.config?.url?.startsWith(path)) &&
      readSession()
    ) {
      const config = error.config as RetriableConfig;
      config._retried = true;

      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
      const token = await refreshInFlight;

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
        return api.request(config);
      }
      writeSession(null);
    }

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
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const response = await api.request<T>({ method, url, data, headers });
  return response.data;
}
