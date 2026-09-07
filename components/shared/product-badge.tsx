import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { ProductBadge as BadgeKind } from "@/types";

const styles: Record<BadgeKind, string> = {
  hit: "bg-badge-hit text-badge-hit-ink",
  new: "bg-badge-new text-white",
  rec: "bg-badge-rec text-white",
};

export function ProductBadge({
  kind,
  className,
}: {
  kind: BadgeKind;
  className?: string;
}) {
  const t = useTranslations("Catalog.badges");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-[0.6875rem] leading-none font-semibold",
        styles[kind],
        className
      )}
    >
      {t(kind)}
    </span>
  );
}
