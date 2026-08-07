import { getRequestConfig } from "next-intl/server";

import { buildContentMessages, deepMerge } from "@/lib/api/content";

import { defaultLocale, locales, type AppLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale = locales.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : defaultLocale;

  const bundled = (await import(`@/messages/${locale}.json`)).default;

  // Live product and article copy is layered over the bundled bundle, so the
  // storefront reads from the CMS when the backend answers and silently keeps
  // its shipped copy when it does not.
  const overlay = await buildContentMessages(locale);

  return {
    locale,
    timeZone: "Asia/Tashkent",
    messages: deepMerge(bundled, overlay),
  };
});
