import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CtaBand } from "@/components/layout/cta-band";
import { BlogHighlights } from "@/components/pages/home/blog-highlights";
import { Certificates } from "@/components/pages/home/certificates";
import { ExpertVideos } from "@/components/pages/home/expert-videos";
import { FeatureStrip } from "@/components/pages/home/feature-strip";
import { Hero } from "@/components/pages/home/hero";
import { PopularProducts } from "@/components/pages/home/popular-products";
import { Reviews } from "@/components/pages/home/reviews";
import { StatsBand } from "@/components/pages/home/stats-band";
import { WhyNuma } from "@/components/pages/home/why-numa";
import { JsonLd } from "@/components/shared/json-ld";
import { itemListJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { getFeaturedProducts } from "@/lib/data/products";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.home" });

  return buildMetadata({
    locale,
    path: "/",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Product" });
  const featured = getFeaturedProducts();

  return (
    <>
      <Hero />
      <FeatureStrip />
      <PopularProducts />
      <WhyNuma />
      <StatsBand />
      <ExpertVideos />
      <Certificates />
      <BlogHighlights />
      <Reviews />
      <CtaBand />

      <JsonLd
        data={itemListJsonLd(
          locale,
          featured.map((product) => ({
            name: t(`${product.slug}.name`),
            path: `/products/${product.slug}`,
          }))
        )}
      />
    </>
  );
}
