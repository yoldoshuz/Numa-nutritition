import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { SlotImage } from "@/components/shared/slot-image";
import type { ProductContent } from "@/lib/api/blocks";
import { hasSlots } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Step {
  title: string;
  text: string;
}

export function ProductUsage({
  product,
  content,
}: {
  product: Product;
  content?: ProductContent;
}) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");

  /*
   * The admin's "как принимать" and "важно соблюдать" blocks. The step
   * numbers come from the order, not from the copy, so a product with three
   * steps or with six renders correctly either way.
   *
   * `important` used to be one shared list under `Product.important` — the same
   * four rules on every page in the range — which is exactly what the CMS block
   * replaces per product.
   */
  const cms = content?.howToUse;
  const steps = cms?.steps ?? (t.raw("steps") as Step[]);
  const heading = cms?.title || tProduct("usageTitle", { name: t("name") });
  const subtitle = cms?.subtitle || tProduct("usageSubtitle");
  const warnings = content?.warnings;
  const important = warnings?.items ?? (tProduct.raw("important") as string[]);

  /*
   * One photograph, from the slot shot for these instructions.
   *
   * The three frames here used to be `gallery_3`, `gallery_4` and `gallery_1` —
   * the slider's own pictures a screen further down — and on a product with one
   * upload, the same bundled placeholder three times. When `how_to_use_1` is
   * empty the steps take the full width instead of a column collapsing into a
   * mint box.
   */
  const illustrated = hasSlots(product.images, "how_to_use_1");

  return (
    <section className="py-14 lg:py-18">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {heading}
          </h2>
          {subtitle && (
            <p className="text-sm leading-relaxed text-muted-ink">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            "mt-9 grid gap-6",
            illustrated && "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8",
          )}
        >
          <ol className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <li key={step.title + index} className="flex items-stretch gap-3">
                <span className="mt-1 grid size-9 shrink-0 place-items-center self-start rounded-full border-2 border-brand font-heading text-sm font-extrabold text-brand">
                  {index + 1}
                </span>
                <div className="flex-1 rounded-lg bg-brand px-4 py-3 text-white">
                  <p className="text-[0.8125rem] font-bold">{step.title}</p>
                  <p className="mt-0.5 text-[0.75rem] leading-relaxed text-white/90">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-4">
            <SlotImage
              images={product.images}
              slot="how_to_use_1"
              alt={heading}
              sizes="(max-width: 1024px) 100vw, 620px"
              className="rounded-2xl bg-surface-mint"
            />

            {/*
              "Важно соблюдать" has no slot of its own — it is a list of rules,
              and the photo that used to sit beside it was borrowed from the
              gallery. It keeps the dark green plate, which is what the design
              asks for and what the copy reads on.
            */}
            <div className="flex flex-col justify-center gap-2 rounded-2xl bg-gradient-to-t from-brand-900 to-brand-700 p-6 sm:bg-gradient-to-r sm:p-8">
              <p className="text-sm font-bold text-white">
                {warnings?.title || tProduct("importantTitle")}
              </p>
              <ul className="flex flex-col gap-1.5">
                {important.map((rule) => (
                  <li
                    key={rule}
                    className="text-[0.6875rem] leading-snug text-white/90 before:mr-1.5 before:content-['•']"
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
