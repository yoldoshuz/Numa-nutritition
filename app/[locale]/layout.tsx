import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/shared/json-ld";
import { AuthProvider, CartProvider, QueryProvider } from "@/hooks";
import { getProducts } from "@/lib/api/catalog";
import { htmlLang, locales, routing, type AppLocale } from "@/lib/i18n/routing";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { alternateLanguages, localizedUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

import "../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * How long a rendered page may be reused before it is built again, in seconds.
 *
 * Applies to every route under this layout. Without it the storefront is a
 * pure build-time snapshot: the catalogue is read with axios, which Next's
 * fetch cache knows nothing about, so nothing ever marks a page stale and a
 * moderator's edit only appears after a redeploy. Kept in step with
 * `CATALOG_REVALIDATE_SECONDS`, which governs the same window on the client.
 *
 * Must stay a literal — Next evaluates this statically and rejects an import.
 */
export const revalidate = 300;

export const viewport: Viewport = {
  themeColor: "#26d883",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "Meta.home" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: `%s | ${siteConfig.name}`,
    },
    description: t("description"),
    applicationName: siteConfig.name,
    generator: "Next.js",
    manifest: "/manifest.webmanifest",
    alternates: {
      canonical: localizedUrl(locale as AppLocale, "/"),
      languages: alternateLanguages("/"),
    },
    icons: {
      // The tab shows the NUMA Nutrition wordmark itself. `icon.svg` is the
      // square "N" app mark and stays where it belongs — the PWA manifest —
      // because listing it here would win over the .ico in every browser that
      // supports SVG icons.
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      apple: [{ url: "/apple-icon.png" }],
    },
    formatDetection: { telephone: true, address: true, email: true },
    category: "health",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for every message-consuming component below.
  setRequestLocale(locale);

  // The cart addresses items by backend id, so it needs the resolved catalogue.
  const catalog = await getProducts();

  return (
    <html
      lang={htmlLang[locale as AppLocale]}
      className={`${manrope.variable} h-full scroll-pt-28`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-white">
        <NextIntlClientProvider>
          <QueryProvider>
            <AuthProvider>
              <CartProvider catalog={catalog}>
                <Header />
                <main id="main" className="flex-1">
                  {children}
                </main>
                <Footer />
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        <JsonLd
          data={[
            organizationJsonLd(locale as AppLocale),
            websiteJsonLd(locale as AppLocale),
          ]}
        />
      </body>
    </html>
  );
}
