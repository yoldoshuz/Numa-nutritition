import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CtaBand } from "@/components/layout/cta-band";
import { InstagramIcon } from "@/components/shared/brand-icons";
import { Container } from "@/components/shared/container";
import { JsonLd } from "@/components/shared/json-ld";
import { contactInfo } from "@/lib/data/content";
import { breadcrumbJsonLd, localBusinessJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.contacts" });

  return buildMetadata({
    locale,
    path: "/contacts",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
  });
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Contacts" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const rows = [
    { Icon: Phone, label: contactInfo.phone, href: contactInfo.phoneHref },
    { Icon: InstagramIcon, label: contactInfo.instagram, href: contactInfo.instagramHref },
    { Icon: Clock, label: t("schedule") },
    { Icon: MapPin, label: t("address") },
    { Icon: Mail, label: contactInfo.email, href: contactInfo.emailHref },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden pt-12 pb-14 lg:pt-16 lg:pb-20">
        {/* Faint molecular network echoing the Figma hero backdrop. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--color-brand-200)_1.5px,transparent_0)] bg-[length:38px_38px] opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_85%_20%,black,transparent)]"
        />
        <Container>
          <h1 className="max-w-3xl font-heading text-[2rem] leading-tight font-extrabold text-ink sm:text-5xl lg:text-[3.4rem]">
            {t("titleFirst")} <span className="text-brand">{t("titleAccent")}</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-ink sm:text-base">
            {t("description")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={contactInfo.phoneHref}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-7 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {tCommon("callNow")}
            </a>
            <a
              href={contactInfo.telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-300 px-7 text-sm font-medium text-brand-700 transition-colors duration-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {t("telegram")}
            </a>
          </div>
        </Container>
      </section>

      <section className="pb-14 lg:pb-20">
        <Container>
          <h2 className="font-heading text-2xl font-extrabold text-ink sm:text-[2rem]">
            {t("infoTitle")}
          </h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
              <h3 className="font-heading text-xl font-extrabold text-brand">
                {t("cardTitle")}
              </h3>
              <ul className="mt-6 flex flex-col gap-5">
                {rows.map(({ Icon, label, href }) => (
                  <li key={label} className="flex items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand">
                      <Icon className="size-5" />
                    </span>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-[0.9375rem] font-semibold text-ink transition-colors hover:text-brand"
                      >
                        {label}
                      </a>
                    ) : (
                      <span className="text-[0.9375rem] font-semibold text-ink">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-80 overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-card lg:min-h-full">
              <iframe
                title={t("mapAlt")}
                src={contactInfo.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
              <a
                href={contactInfo.mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-4 bottom-4 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-brand shadow-card transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {t("openMap")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand variant="needHelp" />

      <JsonLd
        data={[
          localBusinessJsonLd(locale),
          breadcrumbJsonLd(locale, [
            { name: tNav("home"), path: "/" },
            { name: tNav("contacts"), path: "/contacts" },
          ]),
        ]}
      />
    </>
  );
}
