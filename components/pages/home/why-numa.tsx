import Image from "next/image";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { benefitWheel } from "@/lib/data/content";
import { Link } from "@/lib/i18n/navigation";
import { cn, polarPosition } from "@/lib/utils";

/**
 * Six items evenly spaced every 60°, starting at 12 o'clock — the exact
 * arrangement from the Figma wheel. `side` decides which way the label reads.
 */
const orbit: Record<string, { angle: number; side: "left" | "right" }> = {
  immunity: { angle: 0, side: "right" },
  detox: { angle: 60, side: "right" },
  energy: { angle: 120, side: "right" },
  heart: { angle: 180, side: "right" },
  beauty: { angle: 240, side: "left" },
  digestion: { angle: 300, side: "left" },
};

function WheelIcon({ src }: { src: string }) {
  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white shadow-card ring-1 ring-line/70">
      <Image src={src} alt="" width={32} height={32} className="size-6 object-contain" />
    </span>
  );
}

export function WhyNuma() {
  const t = useTranslations("Home.why");
  const tCommon = useTranslations("Common");

  return (
    <section id="why" className="relative isolate py-14 lg:py-20">
      <LeafDecor corners={["top-left", "bottom-left"]} />
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10">
        <div className="flex flex-col items-start gap-5">
          <h2 className="max-w-sm font-heading text-[1.75rem] leading-[1.15] font-extrabold text-ink sm:text-4xl lg:text-[2.6rem]">
            {t("title")}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-ink sm:text-base">
            {t("description")}
          </p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-6 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {tCommon("goToCatalog")}
          </Link>
        </div>

        {/* Below `lg` the wheel is unreadable, so it degrades to a plain grid. */}
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden">
          {benefitWheel.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <WheelIcon src={item.icon} />
              <div className="min-w-0">
                <p className="font-heading text-[0.9375rem] font-bold text-teal-brand">
                  {t(`wheel.${item.id}.title`)}
                </p>
                <p className="text-[0.75rem] leading-snug text-muted-ink">
                  {t(`wheel.${item.id}.text`)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="relative hidden aspect-[7/5] w-full lg:block">
          {/* The dashed circle IS the coordinate space, so every item is exact. */}
          <div className="absolute top-1/2 left-1/2 aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal-brand/40">
            <div className="absolute top-1/2 left-1/2 grid size-[62%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-teal-brand/20 bg-white text-center shadow-card">
              <span className="flex flex-col leading-none text-teal-brand">
                <span className="font-heading text-[1.6rem] font-extrabold tracking-tight">
                  NUMA
                </span>
                <span className="mt-1.5 text-[0.5rem] font-bold tracking-[0.36em]">
                  NUTRITION
                </span>
              </span>
            </div>

            {benefitWheel.map((item) => {
              const { angle, side } = orbit[item.id];
              return (
                <div
                  key={item.id}
                  className="absolute size-0"
                  style={polarPosition(angle)}
                >
                  <span className="absolute -translate-x-1/2 -translate-y-1/2">
                    <WheelIcon src={item.icon} />
                  </span>
                  <div
                    className={cn(
                      "absolute top-1/2 w-44 -translate-y-1/2",
                      side === "right" ? "left-10 text-left" : "right-10 text-right"
                    )}
                  >
                    <p className="font-heading text-[0.9375rem] font-bold text-teal-brand">
                      {t(`wheel.${item.id}.title`)}
                    </p>
                    <p className="text-[0.75rem] leading-snug text-muted-ink">
                      {t(`wheel.${item.id}.text`)}
                    </p>
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
