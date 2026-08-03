import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CtaBand } from "@/components/layout/cta-band";
import { ProductBenefits } from "@/components/pages/product/product-benefits";
import { ProductHero } from "@/components/pages/product/product-hero";
import { ProductHighlight } from "@/components/pages/product/product-highlight";
import { ProductPurpose } from "@/components/pages/product/product-purpose";
import { ProductStats } from "@/components/pages/product/product-stats";
import { ProductUsage } from "@/components/pages/product/product-usage";
import { Container } from "@/components/shared/container";
import { JsonLd } from "@/components/shared/json-ld";
import { ProductCard } from "@/components/shared/product-card";
import { getProduct, getRelatedProducts, products } from "@/lib/data/products";
import { formatAmount } from "@/lib/format";
import { locales } from "@/lib/i18n/routing";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

type Params = Promise<{ locale: AppLocale; slug: string }>;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    products.map((product) => ({ locale, slug: product.slug }))
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: `Product.${slug}` });
  const tMeta = await getTranslations({ locale, namespace: "Meta.productTemplate" });

  return buildMetadata({
    locale,
    path: `/products/${slug}`,
    title: tMeta("title", { name: t("name") }),
    description: tMeta("description", {
      tagline: t("tagline"),
      price: formatAmount(product.price, locale),
    }),
    images: [product.hero, product.image],
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations({ locale, namespace: `Product.${slug}` });
  const tProduct = await getTranslations({ locale, namespace: "Product" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const related = getRelatedProducts(slug);

  return (
    <>
      <ProductHero product={product} />
      <ProductPurpose product={product} />
      <ProductUsage product={product} />
      <ProductHighlight product={product} />
      <ProductBenefits product={product} />
      <ProductStats product={product} />

      <section className="pb-14 lg:pb-20">
        <Container>
          <h2 className="font-heading text-2xl font-extrabold text-ink sm:text-[2rem]">
            {tProduct("relatedTitle")}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {related.map((item) => (
              <li key={item.slug} className="h-full">
                <ProductCard product={item} className="h-full" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />

      <JsonLd
        data={[
          productJsonLd({
            locale,
            product,
            name: t("name"),
            description: t("description"),
          }),
          breadcrumbJsonLd(locale, [
            { name: tNav("home"), path: "/" },
            { name: tProduct("breadcrumbProducts"), path: "/products" },
            { name: t("name"), path: `/products/${slug}` },
          ]),
        ]}
      />
    </>
  );
}
