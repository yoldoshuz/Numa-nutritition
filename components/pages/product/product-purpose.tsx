import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { SlotImage } from "@/components/shared/slot-image";
import type { ProductContent } from "@/lib/api/blocks";
import { hasSlots } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface PurposeItem {
  title: string;
  text: string;
}

export function ProductPurpose({
  product,
  content,
}: {
  product: Product;
  content?: ProductContent;
}) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");

  /* The admin's "Для чего нужен" block, or the bundled copy when it has none. */
  const cms = content?.benefits;
  const items = cms?.items ?? (t.raw("purpose") as PurposeItem[]);
  const heading = cms?.title || tProduct("purposeTitle", { name: t("name") });
  const subtitle = cms?.subtitle || t("purposeSubtitle");

  /*
   * Two photographs belong to this block and the section never showed either —
   * only the decorative bottles the storefront bundles. `benefits_1` and
   * `benefits_2` have been fillable in the admin all along, which is also why
   * nobody filled them: there was nowhere for them to appear. One or both may
   * be empty; the section is text-only when both are.
   */
  const shots = hasSlots(product.images, "benefits_1", "benefits_2");
  const paired =
    hasSlots(product.images, "benefits_1") && hasSlots(product.images, "benefits_2");

  return (
    <section className="relative isolate bg-surface-soft/60 py-14 lg:py-18">
      <LeafDecor position="right" />
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {heading}
          </h2>
          {subtitle && (
            <p className="text-sm leading-relaxed text-muted-ink">{subtitle}</p>
          )}
        </div>

        {shots && (
          <div
            className={cn(
              "mt-8 grid gap-4",
              paired ? "sm:grid-cols-2" : "mx-auto max-w-2xl",
            )}
          >
            <SlotImage
              images={product.images}
              slot="benefits_1"
              alt={heading}
              sizes={paired ? "(max-width: 640px) 100vw, 45vw" : "(max-width: 768px) 100vw, 680px"}
              className="rounded-2xl bg-surface-mint"
            />
            <SlotImage
              images={product.images}
              slot="benefits_2"
              alt={heading}
              sizes={paired ? "(max-width: 640px) 100vw, 45vw" : "(max-width: 768px) 100vw, 680px"}
              className="rounded-2xl bg-surface-mint"
            />
          </div>
        )}

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
