/**
 * Consultation requests — the single lead channel every Numa storefront shares.
 *
 * The backend files the request under the store named in `X-Store` and hands it
 * to Bitrix24 asynchronously, so a `201` here means "saved", not "in the CRM";
 * there is nothing for the storefront to poll or retry.
 */

import { ApiError, request } from "./axios";
import { STORE } from "./config";

/** The API rejects anything shorter, so the form has to refuse it first. */
export const PROBLEM_MIN_LENGTH = 10;
export const PROBLEM_MAX_LENGTH = 4000;
export const NAME_MIN_LENGTH = 2;

export interface ConsultationPayload {
  name: string;
  /** Strictly `+998XXXXXXXXX` — build it with `toApiPhone`. */
  phone: string;
  problem: string;
}

export type ConsultationStatus = "new" | "in_progress" | "done" | "rejected";

export interface ConsultationReceipt {
  id: string;
  status: ConsultationStatus;
  createdAt: string;
}

/**
 * The store travels in the header and nowhere else: a `store` in the body is
 * ignored, and a missing header is a flat `400`.
 */
export const postConsultation = (payload: ConsultationPayload) =>
  request<ConsultationReceipt>("post", "/consultations", payload, {
    "X-Store": STORE,
  });

/** Which message the form should show when the request comes back unhappy. */
export type ConsultationFailure = "rateLimit" | "validation" | "network";

/**
 * `429` is the anti-spam cap (5 requests an hour per IP) and is the one failure
 * worth naming to the visitor — everything else reads as "try again".
 */
export function classifyConsultationError(error: unknown): ConsultationFailure {
  const status = error instanceof ApiError ? error.status : 0;
  if (status === 429) return "rateLimit";
  if (status === 422) return "validation";
  return "network";
}
