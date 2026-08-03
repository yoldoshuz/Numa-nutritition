import { useLocale, useTranslations } from "next-intl";

import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types";

export function Price({
  value,
  className,
  currencyClassName,
}: {
  value: number;
  className?: string;
  currencyClassName?: string;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Common");

  return (
    <span className={cn("font-heading font-bold text-ink", className)}>
      {formatAmount(value, locale)}{" "}
      <span className={cn("font-semibold", currencyClassName)}>{t("currency")}</span>
    </span>
  );
}
