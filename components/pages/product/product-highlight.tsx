import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { SlotImage } from "@/components/shared/slot-image";
import type { ProductContent } from "@/lib/api/blocks";
import { hasSlots } from "@/lib/product-images";
import { cn, polarPosition } from "@/lib/utils";
import type { Product } from "@/types";

interface Chip {
  value: string;
  label: string;
}

/**
 * Four chips on the ring diagonals (0° = 12 o'clock, clockwise), matching the
 * Figma composition: dosage top-left, formula top-right, intake bottom-left,
 * age bottom-right.
 *
 * The orbit is a desktop composition. Below `lg` every chip is `static`, which
 * makes the browser ignore both `placement` and the polar `top`/`left`, and the
 * four of them fall into the grid their list gives them — one markup, laid out
 * two ways, rather than two copies of the block with one of them hidden.
 */
const chipOrbit: Array<{ angle: number; placement: string }> = [
  { angle: 315, placement: "lg:right-5 lg:bottom-1 lg:items-end lg:text-right" },
  { angle: 45, placement: "lg:left-5 lg:bottom-1 lg:items-start lg:text-left" },
  { angle: 225, placement: "lg:right-5 lg:top-1 lg:items-end lg:text-right" },
  { angle: 135, placement: "lg:left-5 lg:top-1 lg:items-start lg:text-left" },
];

export function ProductHighlight({
  product,
  content,
}: {
  product: Product;
  content?: ProductContent;
}) {
  const t = useTranslations(`Product.${product.slug}`);

  /*
   * The admin's "описание с цифрами" block. Four chips, because they sit on
   * the ring's four diagonals and a fifth would have nowhere to go — the extra
   * numbers belong in the paragraph beside it.
   */
  const cms = content?.about;
  const chips = (cms?.stats.length
    ? cms.stats.map((stat) => ({ value: stat.value, label: stat.label }))
    : (t.raw("chips") as Chip[])
  ).slice(0, 4);
  const heading = cms?.title || t("highlightTitle");
  const body = cms?.text || t("highlightText");

  /*
   * The ring holds `about_1` — the photograph shot for this block.
   *
   * It used to hold whichever photo was marked main, which is `gallery_1`: the
   * picture the slider opens on, shown again a screen below. And it was
   * rendered twice, the second copy in a block hidden from `lg` and laid out at
   * 0×0 — a file fetched on every visit to be shown at no size at all. With the
   * slot empty the copy and the numbers take the whole width and the ring is
   * not drawn around an empty middle.
   */
  const illustrated = hasSlots(product.images, "about_1");

  return (
    <section className="bg-surface-soft/60 py-14 lg:py-18">
      <Container
        className={cn(
          "grid items-center gap-10",
          illustrated && "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12",
        )}
      >
        <div className="flex flex-col gap-4">
          <h2 className="max-w-md font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {heading}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-ink">{body}</p>

          {/* No ring to orbit, so the numbers stand on their own row. */}
          {!illustrated && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {chips.map((chip, index) => (
                <li
                  key={chip.label + index}
                  className="rounded-xl bg-brand px-4 py-3 text-center text-white shadow-card"
                >
                  <p className="font-heading text-sm leading-tight font-extrabold">
                    {chip.value}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] leading-snug text-white/90">
                    {chip.label}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {illustrated && (
          <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-6 lg:aspect-[7/5] lg:block lg:max-w-none">
            <div className="w-full lg:absolute lg:top-1/2 lg:left-1/2 lg:aspect-square lg:w-[52%] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-full lg:border lg:border-dashed lg:border-brand/45">
              <SlotImage
                images={product.images}
                slot="about_1"
                alt={t("name")}
                sizes="(max-width: 1024px) 90vw, 300px"
                className="rounded-2xl bg-surface-mint lg:absolute lg:top-1/2 lg:left-1/2 lg:w-[84%] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:bg-transparent"
              />

              <ul className="mt-6 grid w-full grid-cols-2 gap-3 lg:contents">
                {chips.map((chip, index) => {
                  const { angle, placement } = chipOrbit[index];
                  return (
                    <li
                      key={chip.label + index}
                      style={polarPosition(angle)}
                      // A grid cell below `lg`; from `lg` a zero-sized anchor
                      // sitting on the ring, with the chip hung off it.
                      className="lg:absolute lg:size-0"
                    >
                      <span
                        aria-hidden
                        className="hidden lg:absolute lg:block lg:size-2.5 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-full lg:bg-brand"
                      />
                      <div
                        className={cn(
                          "flex flex-col rounded-xl bg-brand px-4 py-3 text-center text-white shadow-card",
                          "lg:absolute lg:w-40 lg:text-left",
                          placement,
                        )}
                      >
                        <span className="font-heading text-sm leading-tight font-extrabold">
                          {chip.value}
                        </span>
                        <span className="mt-0.5 text-[0.6875rem] leading-snug text-white/90">
                          {chip.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
