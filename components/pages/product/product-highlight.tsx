import Image from "next/image";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
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
 */
const chipOrbit: Array<{ angle: number; placement: string }> = [
  { angle: 315, placement: "right-5 bottom-1 items-end text-right" },
  { angle: 45, placement: "left-5 bottom-1 items-start text-left" },
  { angle: 225, placement: "right-5 top-1 items-end text-right" },
  { angle: 135, placement: "left-5 top-1 items-start text-left" },
];

export function ProductHighlight({ product }: { product: Product }) {
  const t = useTranslations(`Product.${product.slug}`);
  const chips = (t.raw("chips") as Chip[]).slice(0, 4);

  return (
    <section className="bg-surface-soft/60 py-14 lg:py-18">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="max-w-md font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {t("highlightTitle")}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-ink">
            {t("highlightText")}
          </p>
        </div>

        {/* Below `lg` the ring collapses into a readable chip grid. */}
        <div className="flex flex-col items-center gap-6 lg:hidden">
          <Image
            src={product.ringImage}
            alt=""
            width={220}
            height={420}
            sizes="40vw"
            className="h-52 w-auto object-contain"
          />
          <ul className="grid w-full grid-cols-2 gap-3">
            {chips.map((chip) => (
              <li key={chip.label} className="rounded-xl bg-brand px-4 py-3 text-center text-white shadow-card">
                <p className="font-heading text-sm leading-tight font-extrabold">{chip.value}</p>
                <p className="mt-0.5 text-[0.6875rem] leading-snug text-white/90">{chip.label}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden aspect-[7/5] w-full lg:block">
          <div className="absolute top-1/2 left-1/2 aspect-square w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand/45">
            <Image
              src={product.ringImage}
              alt=""
              width={240}
              height={460}
              sizes="240px"
              className="absolute top-1/2 left-1/2 h-[86%] w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
            />

            {chips.map((chip, index) => {
              const { angle, placement } = chipOrbit[index];
              return (
                <div key={chip.label} className="absolute size-0" style={polarPosition(angle)}>
                  <span
                    aria-hidden
                    className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand"
                  />
                  <div className={cn("absolute flex w-40 flex-col", placement)}>
                    <span className="rounded-xl bg-brand px-4 py-3 text-white shadow-card">
                      <span className="block font-heading text-sm leading-tight font-extrabold">
                        {chip.value}
                      </span>
                      <span className="mt-0.5 block text-[0.6875rem] leading-snug text-white/90">
                        {chip.label}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
