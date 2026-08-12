import Image from "next/image";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Carousel } from "@/components/shared/carousel";
import { Container } from "@/components/shared/container";
import type { Product } from "@/types";

export function ProductBenefits({ product }: { product: Product }) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");

  const benefits = t.raw("benefits") as string[];
  const title = tProduct("benefitsTitle", { name: t("name") });

  return (
    <section className="py-14 lg:py-18">
      <Container>
        <h2 className="text-center font-heading text-2xl leading-tight font-extrabold text-brand sm:text-[2rem]">
          {title}
        </h2>

        <Carousel
          label={title}
          className="mt-8"
          itemClassName="w-full"
          trackClassName="gap-4"
        >
          {/*
            The slot takes whatever the moderator uploaded — a wide lifestyle
            frame or an upright packshot — so it letterboxes onto the mint plate
            instead of cropping. A 16:7 crop of a bottle is a horizontal band
            across the middle of the label and reads as a broken image.

            On a phone that band is only ~145px tall, which leaves an upright
            bottle the size of a thumbnail, hence the deeper box below `sm`.
          */}
          {product.benefitSlides.map((slide) => (
            <div
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-mint sm:aspect-[16/7]"
              key={slide}
            >
              <Image
                src={slide}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-contain"
              />
            </div>
          ))}
        </Carousel>

        <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:gap-4">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-card"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="text-[0.75rem] leading-snug text-ink-soft">{benefit}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
