import { useTranslations } from "next-intl";

import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  value,
  className,
  currencyClassName,
}: {
  value: number;
  className?: string;
  currencyClassName?: string;
}) {
  const t = useTranslations("Common");

  return (
    <span className={cn("font-heading font-bold text-ink", className)}>
      {formatAmount(value)}{" "}
      <span className={cn("font-semibold", currencyClassName)}>{t("currency")}</span>
    </span>
  );
}
