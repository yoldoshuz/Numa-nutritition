import type { AppLocale } from "@/lib/i18n/routing";
import { htmlLang } from "@/lib/i18n/routing";
import { localizedUrl } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { contactInfo, socialLinks } from "@/lib/data/content";
import type { BlogPost, Product } from "@/types";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(locale: AppLocale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: localizedUrl(locale, "/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon.svg"),
    },
    foundingDate: String(siteConfig.foundingYear),
    email: contactInfo.email,
    telephone: contactInfo.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    sameAs: socialLinks.map((link) => link.href),
  };
}

export function websiteJsonLd(locale: AppLocale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: localizedUrl(locale, "/"),
    inLanguage: htmlLang[locale],
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${localizedUrl(locale, "/products")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessJsonLd(locale: AppLocale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    url: localizedUrl(locale, "/contacts"),
    image: absoluteUrl(siteConfig.ogImage),
    telephone: contactInfo.phone,
    email: contactInfo.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contactInfo.geo.latitude,
      longitude: contactInfo.geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "20:00",
    },
  };
}

export function productJsonLd({
  locale,
  product,
  name,
  description,
}: {
  locale: AppLocale;
  product: Product;
  name: string;
  description: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku: product.slug,
    brand: { "@type": "Brand", name: siteConfig.name },
    image: [product.image, product.hero].map((src) => absoluteUrl(src)),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
    },
    offers: {
      "@type": "Offer",
      url: localizedUrl(locale, `/products/${product.slug}`),
      price: product.price,
      priceCurrency: "UZS",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteConfig.url}/#organization` },
    },
  };
}

export function articleJsonLd({
  locale,
  post,
  title,
  description,
}: {
  locale: AppLocale;
  post: BlogPost;
  title: string;
  description: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: htmlLang[locale],
    datePublished: post.date,
    dateModified: post.date,
    image: absoluteUrl(post.cover),
    mainEntityOfPage: localizedUrl(locale, `/blog/${post.slug}`),
    author: { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function breadcrumbJsonLd(
  locale: AppLocale,
  crumbs: Array<{ name: string; path: string }>
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: localizedUrl(locale, crumb.path),
    })),
  };
}

export function itemListJsonLd(
  locale: AppLocale,
  items: Array<{ name: string; path: string }>
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: localizedUrl(locale, item.path),
    })),
  };
}
