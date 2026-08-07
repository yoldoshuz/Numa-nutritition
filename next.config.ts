import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

/**
 * Hosts `next/image` is allowed to load the catalogue's imagery from.
 *
 * The list is built from three sources so a missing or late-bound env var can
 * never leave it empty — `next.config` is evaluated at build time, and an image
 * host that is only known at runtime would fail the request with
 * "hostname is not configured".
 *
 *   1. the production backend, which is a constant for this project;
 *   2. whatever NEXT_PUBLIC_API_URL points at, so previews and local runs work;
 *   3. NEXT_PUBLIC_MEDIA_HOSTS, a comma-separated escape hatch for a CDN or a
 *      one-off environment.
 */
const DEFAULT_MEDIA_HOSTS = ["numa.yoldosh.uz"];

function mediaHosts(): string[] {
  const hosts = new Set(DEFAULT_MEDIA_HOSTS);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      hosts.add(new URL(apiUrl).hostname);
    } catch {
      // A malformed value must not take the whole build down.
    }
  }

  for (const host of (process.env.NEXT_PUBLIC_MEDIA_HOSTS ?? "").split(",")) {
    const trimmed = host.trim();
    if (trimmed) hosts.add(trimmed);
  }

  return [...hosts];
}

// Both schemes are allowed: production is https, a local backend is plain http.
const remotePatterns = mediaHosts().flatMap((hostname) =>
  (["https", "http"] as const).map((protocol) => ({
    protocol,
    hostname,
    pathname: "/public/**",
  })),
);

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
