import Image from "next/image";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";

export function BlogHero() {
  const t = useTranslations("Blog");

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      <LeafDecor corners={["top-left"]} />

      <Container className="grid items-center gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:py-16">
        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-[2.25rem] leading-[1.08] font-extrabold text-ink sm:text-5xl lg:text-[3.25rem]">
            {t("heroTitle")}
            <span className="mt-1 block text-brand">{t("heroAccent")}</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-ink sm:text-base">
            {t("heroDescription")}
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href="#latest"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-6 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {t("latest")}
            </a>
            <a
              href="#popular"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-300 px-6 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {t("popular")}
            </a>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <Image
            src="/image 49.png"
            alt={t("heroImageAlt")}
            width={760}
            height={620}
            priority
            sizes="(max-width: 1024px) 80vw, 520px"
            className="h-auto w-full max-w-sm object-contain lg:max-w-lg"
          />
        </div>
      </Container>
    </section>
  );
}
