import type { Metadata } from "next";

import {
  defaultLocale,
  htmlLang,
  locales,
  type AppLocale,
} from "@/lib/i18n/routing";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * Builds the locale-aware pathname. `localePrefix` is `as-needed`, so the
 * default locale keeps clean URLs while the others are prefixed.
 */
export function localizedPath(locale: AppLocale, path = "/"): string {
  const normalized = path === "/" ? "" : path.replace(/\/$/, "");
  if (locale === defaultLocale) return normalized || "/";
  return `/${locale}${normalized}`;
}

export function localizedUrl(locale: AppLocale, path = "/"): string {
  return absoluteUrl(localizedPath(locale, path));
}

/** `hreflang` map including `x-default`, required for correct indexing. */
export function alternateLanguages(path = "/"): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[htmlLang[locale]] = localizedUrl(locale, path);
  }
  languages["x-default"] = localizedUrl(defaultLocale, path);
  return languages;
}

interface BuildMetadataOptions {
  locale: AppLocale;
  /** Locale-independent path, e.g. `/products/cardio-control`. */
  path?: string;
  title: string;
  description: string;
  keywords?: string[];
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  locale,
  path = "/",
  title,
  description,
  keywords,
  images,
  type = "website",
  publishedTime,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = localizedUrl(locale, path);
  const ogImages = (images?.length ? images : [siteConfig.ogImage]).map(
    (image) => ({
      url: absoluteUrl(image),
      width: 1200,
      height: 630,
      alt: title,
    })
  );

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: alternateLanguages(path),
    },
    openGraph: {
      type,
      url,
      siteName: siteConfig.name,
      title,
      description,
      locale: htmlLang[locale].replace("-", "_"),
      images: ogImages,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitter,
      title,
      description,
      images: ogImages.map((image) => image.url),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
