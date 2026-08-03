import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";

interface Section {
  heading: string;
  text: string;
}

export function LegalPage({ document }: { document: "privacy" | "terms" }) {
  const t = useTranslations("Legal");
  const sections = t.raw(`${document}.sections`) as Section[];

  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-prose-page">
        <h1 className="font-heading text-[1.75rem] font-extrabold text-ink sm:text-4xl">
          {t(`${document}.title`)}
        </h1>
        <p className="mt-2 text-xs text-muted-ink">{t("updated")}</p>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-soft">
          {t(`${document}.intro`)}
        </p>

        {sections.map((section) => (
          <section key={section.heading} className="mt-7">
            <h2 className="font-heading text-lg font-extrabold text-ink sm:text-xl">
              {section.heading}
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-ink">
              {section.text}
            </p>
          </section>
        ))}
      </Container>
    </section>
  );
}
