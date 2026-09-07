import { API_BASE_URL } from "./config";

/**
 * Origin serving the backend's static files, derived from the API base by
 * dropping the `/api/v1` suffix.
 */
const MEDIA_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, "");

/**
 * Resolves an image URL coming from the API.
 *
 * The catalogue's imagery is served by the backend under `/public/...`, so it
 * has to be resolved against the API origin rather than this storefront's.
 * Absolute URLs (an S3 or CDN link set in the CMS) pass through untouched, and
 * so does anything else — that is the storefront's own bundled artwork, used
 * whenever the static fallback is in play.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/public/") && MEDIA_ORIGIN) return `${MEDIA_ORIGIN}${url}`;
  return url;
}
