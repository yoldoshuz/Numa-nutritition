import { useTranslations } from "next-intl";

import { Carousel } from "@/components/shared/carousel";
import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { ProductCard } from "@/components/shared/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getFeaturedProducts } from "@/lib/data/products";
import { Link } from "@/lib/i18n/navigation";

export function PopularProducts() {
  const t = useTranslations("Home.popular");
  const tCommon = useTranslations("Common");
  const featured = getFeaturedProducts();

  return (
    <section id="products" className="relative isolate py-14 lg:py-20">
      <LeafDecor position="both" />
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          action={
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-300 px-5 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {tCommon("allProducts")}
            </Link>
          }
        />

        <Carousel
          label={t("title")}
          className="mt-8"
          itemClassName="w-[16rem] sm:w-[17.5rem] lg:w-[calc((100%-4.5rem)/4)]"
        >
          {featured.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
