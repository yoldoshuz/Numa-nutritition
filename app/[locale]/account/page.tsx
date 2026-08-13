import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountView } from "@/components/pages/account/account-view";
import type { AppLocale } from "@/types";

/**
 * The account is per-visitor and lives behind a token the server never sees, so
 * it renders on the client and stays out of the index.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountView />;
}
