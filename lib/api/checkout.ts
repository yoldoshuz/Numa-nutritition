/** Client-side helpers shared by the checkout form. */

import { ApiError } from "./axios";
import type { PaymentMethod } from "./types";

/** Methods the storefront may offer, narrowed by env to what's provisioned. */
const ALL_METHODS: PaymentMethod[] = ["cash", "click", "payme", "uzum"];

/**
 * Which payment methods to show. Defaults to cash + the two providers that
 * have credentials on the backend; Uzum stays off until its Merchant API keys
 * are configured, since offering it would hand the customer a dead redirect.
 */
export function enabledPaymentMethods(): PaymentMethod[] {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_METHODS;
  if (!raw) return ["cash", "click", "payme"];

  const requested = raw
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .filter((m): m is PaymentMethod => (ALL_METHODS as string[]).includes(m));

  return requested.length ? requested : ["cash"];
}

/**
 * Coerces what people actually type into the `+998XXXXXXXXX` the API demands:
 * `90 123 45 67`, `998901234567`, `+998 (90) 123-45-67` all normalize.
 * Returns null when the result still isn't a valid Uzbek mobile number.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  const national =
    digits.length === 9 ? digits
    : digits.startsWith("998") && digits.length === 12 ? digits.slice(3)
    : null;

  return national ? `+998${national}` : null;
}

/** Stable per-attempt key so a retry cannot create a second order. */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Maps a failed checkout onto the message key the form should render. */
export function checkoutErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return "errorStock";
    if (error.status === 0 || error.status === 408) return "errorOffline";
  }
  return "errorGeneric";
}
