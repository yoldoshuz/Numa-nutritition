import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ConsultationForm } from "@/components/pages/consultation/consultation-form";
import { Container } from "@/components/shared/container";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.consultation" });

  return buildMetadata({
    locale,
    path: "/consultation",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
  });
}

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Consultation" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  return (
    <section className="relative isolate overflow-hidden py-14 lg:py-20">
      {/* Mint-to-white wash matching the consultation screen in Figma. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-brand-50 to-brand-100"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-24 -z-10 size-[34rem] rounded-full bg-brand/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-24 -bottom-24 -z-10 size-[30rem] rounded-full bg-brand-300/40 blur-3xl"
      />

      <Container className="max-w-3xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-heading text-[2rem] leading-tight font-extrabold sm:text-5xl">
            <span className="block text-brand-400">{t("titleFirst")}</span>
            <span className="block text-brand">{t("titleSecond")}</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            {t("description")}
          </p>
        </div>

        <div className="mt-9">
          <ConsultationForm />
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "/" },
          { name: tCommon("consultation"), path: "/consultation" },
        ])}
      />
    </section>
  );
}
