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

/** Raised before a request is attempted when no backend is configured. */
export class ApiUnavailableError extends ApiError {
  constructor() {
    super("API is not configured", 0);
    this.name = "ApiUnavailableError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Seconds for Next's data cache; omit to opt out of caching entirely. */
  revalidate?: number;
  /** Send the guest cart token from localStorage (browser only). */
  withCartToken?: boolean;
}

/** Cart token lives in localStorage so it survives third-party cookie blocking. */
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

/**
 * Calls the Numa API and unwraps its `{ success, data }` envelope.
 *
 * Every failure mode — unconfigured backend, DNS, timeout, 5xx, malformed
 * payload — surfaces as an `ApiError`, so callers only ever need one `catch` to
 * fall back to the bundled static catalogue.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isApiConfigured()) throw new ApiUnavailableError();

  const { body, revalidate, withCartToken, headers, ...init } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const requestHeaders = new Headers(headers);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");

  if (withCartToken) {
    const token = readCartToken();
    if (token) requestHeaders.set("X-Cart-Token", token);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      // `revalidate` and `no-store` are mutually exclusive in Next's fetch.
      ...(revalidate === undefined
        ? { cache: "no-store" as const }
        : { next: { revalidate } }),
    });

    // The backend echoes the guest cart token on every cart response; capturing
    // it here keeps the session alive without relying on cross-site cookies.
    if (withCartToken) {
      const issued = response.headers.get("X-Cart-Token");
      if (issued) writeCartToken(issued);
    }

    let payload: ApiEnvelope<T> | null = null;
    try {
      payload = (await response.json()) as ApiEnvelope<T>;
    } catch {
      // Fall through to the status-based error below.
    }

    if (!response.ok || !payload?.success) {
      throw new ApiError(
        payload?.message ?? `Request failed with ${response.status}`,
        response.status,
        payload?.errors,
      );
    }

    return payload.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(`Request timed out after ${API_TIMEOUT_MS}ms`, 408);
    }
    throw new ApiError(error instanceof Error ? error.message : "Network error", 0);
  } finally {
    clearTimeout(timeout);
  }
}
