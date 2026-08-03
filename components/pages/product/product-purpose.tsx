import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import type { Product } from "@/types";

interface PurposeItem {
  title: string;
  text: string;
}

export function ProductPurpose({ product }: { product: Product }) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");

  const items = t.raw("purpose") as PurposeItem[];

  return (
    <section className="relative isolate bg-surface-soft/60 py-14 lg:py-18">
      <LeafDecor position="right" />
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {tProduct("purposeTitle", { name: t("name") })}
          </h2>
          <p className="text-sm leading-relaxed text-muted-ink">{t("purposeSubtitle")}</p>
        </div>

        <ul className="mt-9 grid gap-4 md:grid-cols-2 lg:gap-5">
          {items.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-line bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
            >
              <h3 className="font-heading text-[0.875rem] font-bold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-ink">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
