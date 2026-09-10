import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { SlotImage } from "@/components/shared/slot-image";
import type { ProductContent } from "@/lib/api/blocks";
import type { Product } from "@/types";

export function ProductBenefits({
  product,
  content,
}: {
  product: Product;
  content?: ProductContent;
}) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");

  /* The admin's "Преимущества" block, or the bundled copy when it has none. */
  const cms = content?.advantages;
  const benefits = cms?.items ?? (t.raw("benefits") as string[]);
  const title = cms?.title || tProduct("benefitsTitle", { name: t("name") });

  return (
    <section className="py-14 lg:py-18">
      <Container>
        <h2 className="text-center font-heading text-2xl leading-tight font-extrabold text-brand sm:text-[2rem]">
          {title}
        </h2>

        {/*
          One picture, from the slot named after this block, in the shape it was
          shot in.

          This was a carousel over the whole photo set inside a 1200×525 frame,
          which for a catalogue shot 1:1 meant every slide was a horizontal band
          across the middle of a bottle. On King Bee it was a carousel of one
          bundled placeholder. Empty slot, no picture: the checklist below is
          the section.
        */}
        <SlotImage
          images={product.images}
          slot="advantages_1"
          alt={title}
          sizes="(max-width: 1024px) 100vw, 900px"
          className="mx-auto mt-8 w-full max-w-3xl rounded-2xl bg-surface-mint"
        />

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
