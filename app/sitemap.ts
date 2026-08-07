import type { MetadataRoute } from "next";

import { getBlogPosts, getProducts } from "@/lib/api/catalog";
import { defaultLocale, htmlLang, locales } from "@/lib/i18n/routing";
import { localizedUrl } from "@/lib/seo";

interface Entry {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified?: string;
}

const staticEntries: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/contacts", priority: 0.6, changeFrequency: "monthly" },
  { path: "/consultation", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [products, blogPosts] = await Promise.all([getProducts(), getBlogPosts()]);

  const entries: Entry[] = [
    ...staticEntries,
    ...products.map<Entry>((product) => ({
      path: `/products/${product.slug}`,
      priority: 0.8,
      changeFrequency: "monthly",
    })),
    ...blogPosts.map<Entry>((post) => ({
      path: `/blog/${post.slug}`,
      priority: 0.6,
      changeFrequency: "monthly",
      lastModified: post.date,
    })),
  ];

  // One URL per locale, each carrying the full `hreflang` alternate set.
  return entries.flatMap((entry) =>
    locales.map((locale) => ({
      url: localizedUrl(locale, entry.path),
      lastModified: entry.lastModified ? new Date(entry.lastModified) : now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((alt) => [htmlLang[alt], localizedUrl(alt, entry.path)])
          ),
          "x-default": localizedUrl(defaultLocale, entry.path),
        },
      },
    }))
  );
}
