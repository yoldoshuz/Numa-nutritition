import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CtaBand } from "@/components/layout/cta-band";
import { Container } from "@/components/shared/container";
import { JsonLd } from "@/components/shared/json-ld";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { ProductCard } from "@/components/shared/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getProducts } from "@/lib/api/catalog";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.products" });

  return buildMetadata({
    locale,
    path: "/products",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
  });
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Catalog" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  const tProduct = await getTranslations({ locale, namespace: "Product" });

  const products = await getProducts();

  const listItems = products.map((product) => ({
    name: tProduct(`${product.slug}.name`),
    path: `/products/${product.slug}`,
  }));

  return (
    <>
      <section className="relative isolate pt-10 pb-14 lg:pt-14 lg:pb-20">
        <LeafDecor position="both" />
        <Container>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />

          <ul className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {products.map((product, index) => (
              <li key={product.slug} className="h-full">
                <ProductCard product={product} priority={index < 4} className="h-full" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />

      <JsonLd
        data={[
          itemListJsonLd(locale, listItems),
          breadcrumbJsonLd(locale, [
            { name: tNav("home"), path: "/" },
            { name: tNav("products"), path: "/products" },
          ]),
        ]}
      />
    </>
  );
}
