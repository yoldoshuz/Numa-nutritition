/**
 * Callback requests — the "leave your number" form in the footer.
 *
 * Deliberately not a consultation. A consultation carries a description of the
 * problem the manager reads before dialling; this carries a phone number and
 * nothing else, and the backend keeps the two in separate tables and separate
 * sections of the admin panel. Sending one as the other would fill the
 * consultation list with blank cards.
 *
 * The backend files the request under the store named in `X-Store` and hands it
 * to Bitrix24 asynchronously, so a `201` here means "saved", not "in the CRM".
 */

import { ApiError, request } from "./axios";
import { STORE } from "./config";

export interface SupportRequestReceipt {
  id: string;
  status: "new";
  createdAt: string;
}

/**
 * One field, on purpose: every extra box in a block like this costs a share of
 * the leads, and the manager asks for a name in the first second of the call.
 * `name`, `problem` and `comment` are ignored by the endpoint.
 *
 * The store travels in the header and nowhere else — a `store` in the body is
 * ignored, and a missing or unknown header is a flat `400`. The city is not
 * asked for either; the backend resolves it from the request IP.
 *
 * @param phone Strictly `+998XXXXXXXXX` — build it with `toApiPhone`.
 */
export const postSupportRequest = (phone: string) =>
  request<SupportRequestReceipt>("post", "/support-requests", { phone }, {
    "X-Store": STORE,
  });

/** Which message the form should show when the request comes back unhappy. */
export type SupportRequestFailure = "rateLimit" | "validation" | "network";

/**
 * `429` is the anti-spam cap — 20 requests an hour per IP — and is the one
 * failure worth naming to the visitor. It does not mean anything is broken, so
 * the form must not retry it automatically; an office NAT can reach it while
 * every person behind it is real.
 */
export function classifySupportRequestError(error: unknown): SupportRequestFailure {
  const status = error instanceof ApiError ? error.status : 0;
  if (status === 429) return "rateLimit";
  if (status === 400 || status === 422) return "validation";
  return "network";
}
