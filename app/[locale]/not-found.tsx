import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { Link } from "@/lib/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const tCommon = useTranslations("Common");

  return (
    <section className="py-20 lg:py-28">
      <Container className="flex max-w-lg flex-col items-center gap-4 text-center">
        <p className="font-heading text-6xl font-extrabold text-brand sm:text-8xl">
          {t("code")}
        </p>
        <h1 className="font-heading text-2xl font-extrabold text-ink sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm leading-relaxed text-muted-ink">{t("description")}</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            {tCommon("backHome")}
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-300 px-7 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            {tCommon("goToCatalog")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
