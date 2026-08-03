import { useTranslations } from "next-intl";

import { ProductGallery } from "@/components/pages/product/product-gallery";
import { ProductPurchase } from "@/components/pages/product/product-purchase";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { Price } from "@/components/shared/price";
import { ProductBadge } from "@/components/shared/product-badge";
import type { Product } from "@/types";

interface Spec {
  label: string;
  value: string;
}

export function ProductHero({ product }: { product: Product }) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");
  const tNav = useTranslations("Nav");

  const name = t("name");
  const specs = t.raw("specs") as Spec[];

  return (
    <section className="relative isolate pt-6 pb-12 lg:pt-8 lg:pb-16">
      <LeafDecor position="right" />
      <Container className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery product={product} name={name} />

        <div className="flex flex-col gap-5">
          <Breadcrumbs
            items={[
              { name: tNav("home"), href: "/" },
              { name: tProduct("breadcrumbProducts"), href: "/products" },
              { name },
            ]}
          />

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-[1.75rem] leading-tight font-extrabold text-ink uppercase sm:text-4xl">
                {name}
              </h1>
              <ProductBadge kind={product.badge} />
            </div>
            <p className="text-[0.8125rem] leading-snug font-medium text-brand">
              {t("tagline")}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-ink">{t("description")}</p>

          <Price value={product.price} className="text-2xl sm:text-[1.75rem]" />

          <ProductPurchase slug={product.slug} />

          <div className="mt-2">
            <h2 className="font-heading text-lg font-extrabold text-ink sm:text-xl">
              {tProduct("specsTitle")}
            </h2>
            <dl className="mt-3 divide-y divide-line">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-6 py-2.5 text-[0.8125rem]"
                >
                  <dt className="text-muted-ink">{spec.label}:</dt>
                  <dd className="text-right font-medium text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
