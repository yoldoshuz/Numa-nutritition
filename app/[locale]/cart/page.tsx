import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CtaBand } from "@/components/layout/cta-band";
import { CartView } from "@/components/pages/cart/cart-view";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.cart" });

  // Cart contents are personal and should never be indexed.
  return buildMetadata({
    locale,
    path: "/cart",
    title: t("title"),
    description: t("description"),
    noIndex: true,
  });
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <CartView />
      <CtaBand variant="needHelp" />
    </>
  );
}
