import { useTranslations } from "next-intl";

import { ProductGallery } from "@/components/pages/product/product-gallery";
import { ProductPurchase } from "@/components/pages/product/product-purchase";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { Price } from "@/components/shared/price";
import { ProductBadge } from "@/components/shared/product-badge";
import type { ProductContent } from "@/lib/api/blocks";
import { isSoldOut } from "@/lib/utils";
import type { Product } from "@/types";

interface Spec {
  label: string;
  value: string;
}

export function ProductHero({
  product,
  content,
}: {
  product: Product;
  content?: ProductContent;
}) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");

  const name = t("name");
  const soldOut = isSoldOut(product);

  /*
   * The buy box reads the admin's `hero` and `specs` blocks when the product
   * has them and stays on the bundled copy when it does not. The spec sheet is
   * not limited to the rows the design shipped: a moderator adding "Состав" or
   * dropping "Срок хранения" is the whole point of moving this table into the
   * CMS, so the rows carry their own labels.
   */
  const specs = content?.specs?.items ?? (t.raw("specs") as Spec[]);
  const specsTitle = content?.specs?.title || tProduct("specsTitle");
  const tagline = content?.hero?.tagline || t("tagline");
  const description = content?.hero?.text || t("description");

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
              {soldOut ? (
                <span className="inline-flex items-center rounded-md bg-ink/80 px-2.5 py-1 text-[0.6875rem] leading-none font-semibold text-white">
                  {tCommon("outOfStock")}
                </span>
              ) : content?.hero?.badge ? (
                /*
                 * A plash written in the admin replaces the design's badge
                 * rather than joining it: "Рекомендуем" beside "Хит" is two
                 * claims about the same bottle, and the moderator's is the
                 * specific one.
                 */
                <span className="inline-flex items-center rounded-md bg-brand px-2.5 py-1 text-[0.6875rem] leading-none font-semibold text-white">
                  {content.hero.badge}
                </span>
              ) : (
                <ProductBadge kind={product.badge} />
              )}
            </div>
            {tagline && (
              <p className="text-[0.8125rem] leading-snug font-medium text-brand">
                {tagline}
              </p>
            )}
          </div>

          {description && (
            <p className="text-sm leading-relaxed text-muted-ink">{description}</p>
          )}

          <Price value={product.price} className="text-2xl sm:text-[1.75rem]" />

          <ProductPurchase slug={product.slug} soldOut={soldOut} />

          <div className="mt-2">
            <h2 className="font-heading text-lg font-extrabold text-ink sm:text-xl">
              {specsTitle}
            </h2>
            <dl className="mt-3 divide-y divide-line">
              {specs.map((spec, index) => (
                <div
                  key={spec.label + index}
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
