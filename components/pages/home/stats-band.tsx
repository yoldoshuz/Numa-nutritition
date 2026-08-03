import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { companyStats } from "@/lib/data/content";

export function StatsBand() {
  const t = useTranslations("Home.stats");

  return (
    <section className="relative overflow-hidden bg-brand">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.28)_1px,transparent_0)] bg-[length:26px_26px] opacity-60"
      />
      <Container className="relative grid grid-cols-2 gap-y-8 py-9 lg:grid-cols-4 lg:py-11">
        {companyStats.map((stat) => (
          <div
            key={stat}
            className="px-3 text-center odd:border-white/35 even:border-l even:border-white/35 sm:px-4 lg:border-l lg:first:border-l-0"
          >
            <p className="font-heading text-xl leading-tight font-extrabold text-white sm:text-2xl lg:text-[1.75rem]">
              {t(`${stat}.value`)}
            </p>
            <p className="mt-1 text-[0.75rem] leading-snug text-white/85 lg:text-[0.875rem]">
              {t(`${stat}.label`)}
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
