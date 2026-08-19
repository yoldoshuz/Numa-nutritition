import Image from "next/image";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { Link } from "@/lib/i18n/navigation";

export function Hero() {
  const t = useTranslations("Home.hero");
  const tCommon = useTranslations("Common");

  return (
    <section className="relative overflow-hidden bg-brand">
      <div
        aria-hidden
        className="absolute -top-40 -right-24 size-[42rem] rounded-full bg-white/12 blur-3xl"
      />
      {/* Leaves bleeding in from the right edge, as in the Figma hero. */}
      <Image
        aria-hidden
        src="/image 223-3.png"
        alt=""
        width={339}
        height={537}
        className="pointer-events-none absolute -top-10 right-0 hidden w-40 rotate-12 opacity-90 lg:block xl:w-56"
      />
      <Image
        aria-hidden
        src="/image 224.png"
        alt=""
        width={209}
        height={213}
        className="pointer-events-none absolute right-6 bottom-4 hidden w-28 -rotate-12 opacity-80 lg:block"
      />

      <Container className="relative grid items-center gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:py-0">
        <div className="flex max-w-xl flex-col gap-5 lg:py-20">
          <p className="text-[0.6875rem] leading-relaxed font-semibold tracking-[0.12em] text-white/80 uppercase">
            {t("eyebrow")}
          </p>

          <h1 className="font-heading text-[2rem] leading-[1.12] font-extrabold text-white sm:text-[2.75rem] lg:text-[3.35rem]">
            {t("title")}
          </h1>

          <p className="max-w-md text-[0.9375rem] leading-relaxed text-white/90">
            {t("description")}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-sm font-semibold text-ink transition-all duration-200 hover:bg-brand-50 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-13"
            >
              {t("catalog")}
            </Link>
            <Link
              href="/consultation"
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-white px-7 text-sm font-bold text-white transition-all duration-200 hover:bg-white/15 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-13"
            >
              {tCommon("consultation")}
            </Link>
          </div>
        </div>

        {/* Single artboard export — keeps the exact bottle composition from Figma. */}
        <div className="relative flex justify-center lg:justify-end">
          <Image
            src="/Group 37999.png"
            alt={t("imageAlt")}
            width={1159}
            height={1085}
            priority
            className="h-auto w-full max-w-md select-none lg:max-w-[38rem] lg:translate-y-2"
          />
        </div>
      </Container>
    </section>
  );
}
