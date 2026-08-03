import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { contactInfo } from "@/lib/data/content";
import { Link } from "@/lib/i18n/navigation";

/**
 * The green diamond-patterned band that sits directly above the footer.
 * `variant` mirrors the two versions in the Figma file.
 */
export function CtaBand({ variant = "learnMore" }: { variant?: "learnMore" | "needHelp" }) {
  const t = useTranslations("CtaBand");
  const tCommon = useTranslations("Common");

  const isHelp = variant === "needHelp";

  return (
    <section className="relative overflow-hidden bg-brand">
      <div
        aria-hidden
        className="absolute inset-0 bg-[repeating-conic-gradient(from_45deg,rgb(255_255_255/0.10)_0deg_90deg,rgb(255_255_255/0)_90deg_180deg)] bg-[length:72px_72px]"
      />
      <Container className="relative flex flex-col items-center justify-between gap-4 py-7 text-center sm:flex-row sm:gap-8 sm:text-left lg:py-8">
        <p className="font-heading text-lg leading-snug font-extrabold text-white sm:text-xl lg:text-[1.375rem]">
          {isHelp ? t("needHelp") : t("learnMore")}
        </p>

        {isHelp ? (
          <a
            href={contactInfo.phoneHref}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-brand transition-all duration-200 hover:bg-brand-50 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-14 lg:px-10 lg:text-base"
          >
            {tCommon("callNow")}
          </a>
        ) : (
          <Link
            href="/consultation"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-brand transition-all duration-200 hover:bg-brand-50 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-14 lg:px-10 lg:text-base"
          >
            {tCommon("sendRequest")}
          </Link>
        )}
      </Container>
    </section>
  );
}
