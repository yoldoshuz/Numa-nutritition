import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CtaBand } from "@/components/layout/cta-band";
import { CheckoutView } from "@/components/pages/checkout/checkout-view";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.checkout" });

  return buildMetadata({
    locale,
    path: "/checkout",
    title: t("title"),
    description: t("description"),
    noIndex: true,
  });
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <CheckoutView />
      <CtaBand variant="needHelp" />
    </>
  );
}
