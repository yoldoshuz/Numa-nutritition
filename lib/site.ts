/** Single source of truth for absolute URLs, brand identity and SEO defaults. */
export const siteConfig = {
  name: "NUMA Nutrition",
  legalName: "NUMA NUTRITION",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://numanutrition.uz",
  ogImage: "/Rectangle 1699.png",
  twitter: "@numa_nutrition",
  foundingYear: 2020,
  address: {
    street: "Yakkasaroy",
    city: "Tashkent",
    region: "Toshkent",
    postalCode: "100015",
    country: "UZ",
  },
} as const;

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
