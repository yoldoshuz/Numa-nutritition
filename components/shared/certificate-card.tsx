import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { Certificate } from "@/types";

export function CertificateCard({
  certificate,
  className,
}: {
  certificate: Certificate;
  className?: string;
}) {
  const t = useTranslations(`Home.certificates.items.${certificate.id}`);

  return (
    <article
      className={cn(
        "flex h-full flex-col items-center gap-3 rounded-2xl bg-surface-soft p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card",
        className
      )}
    >
      <Image
        src={certificate.icon}
        alt=""
        width={96}
        height={96}
        className="size-[4.5rem] object-contain sm:size-[5.5rem]"
      />
      <h3 className="font-heading text-base font-extrabold text-ink">{t("title")}</h3>
      <p className="text-[0.8125rem] leading-snug font-medium text-ink-soft">{t("subtitle")}</p>
      <p className="border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-muted-ink">
        {t("text")}
      </p>
    </article>
  );
}
