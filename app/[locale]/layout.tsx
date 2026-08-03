import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/shared/json-ld";
import { CartProvider } from "@/hooks";
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
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
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

  return (
    <html
      lang={htmlLang[locale as AppLocale]}
      className={`${manrope.variable} h-full scroll-pt-28`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-white">
        <NextIntlClientProvider>
          <CartProvider>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
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
