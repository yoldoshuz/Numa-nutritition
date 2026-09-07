import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { PaymentReturnView } from "@/components/pages/payment/payment-return-view";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PaymentReturn" });

  // Carries an orderId and reflects one person's purchase — never index it.
  return buildMetadata({
    locale,
    path: "/payment/return",
    title: t("metaTitle"),
    description: t("metaDescription"),
    noIndex: true,
  });
}

export default async function PaymentReturnPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // useSearchParams needs a Suspense boundary to keep the route static-shell.
  return (
    <Suspense fallback={null}>
      <PaymentReturnView />
    </Suspense>
  );
}
