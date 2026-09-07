import { Factory, Globe, HeartPulse, Leaf, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { heroFeatures } from "@/lib/data/content";

const icons = {
  leaf: Leaf,
  factory: Factory,
  globe: Globe,
  "shield-check": ShieldCheck,
  "heart-pulse": HeartPulse,
} as const;

export function FeatureStrip() {
  const t = useTranslations("Home.features");

  return (
    <section className="border-b border-line bg-white">
      <Container className="grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0 lg:py-7">
        {heroFeatures.map((feature) => {
          const Icon = icons[feature.icon];
          return (
            <div
              key={feature.key}
              className="flex items-center gap-3 lg:justify-center lg:px-4 lg:not-first:border-l lg:not-first:border-line"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-white lg:size-14">
                <Icon className="size-5 lg:size-6" />
              </span>
              <p className="font-heading text-[0.8125rem] leading-tight font-bold text-ink lg:text-[0.9375rem]">
                {t(feature.key)}
              </p>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
