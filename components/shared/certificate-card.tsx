import Image from "next/image";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

import { ISO_22000_CERTIFICATE } from "@/lib/data/content";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/types";

/** The only mark we hold the document for — see `ISO_22000_CERTIFICATE`. */
const DOCUMENTED_ID = "iso";

export function CertificateCard({
  certificate,
  className,
}: {
  certificate: Certificate;
  className?: string;
}) {
  const t = useTranslations(`Home.certificates.items.${certificate.id}`);
  // The footer names this document already; reusing its label keeps one string
  // for one PDF instead of two translations that can drift apart.
  const tFooter = useTranslations("Footer");

  /*
   * Only the mark we hold the PDF for is clickable. The card keeps exactly the
   * same height either way — the affordance is a 13px glyph beside the title,
   * not another line — so one card gaining a link does not stretch the other
   * four in the row to match it.
   */
  const documented = certificate.id === DOCUMENTED_ID;
  const Card = documented ? "a" : "article";

  return (
    <Card
      {...(documented
        ? {
            href: ISO_22000_CERTIFICATE,
            target: "_blank",
            rel: "noreferrer noopener",
          }
        : {})}
      className={cn(
        "flex h-full flex-col items-center gap-3 rounded-2xl bg-surface-soft p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
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
      <h3 className="flex items-center gap-1.5 font-heading text-base font-extrabold text-ink">
        {t("title")}
        {documented && (
          <>
            <FileText className="size-3.5 shrink-0 text-brand" aria-hidden />
            <span className="sr-only">{tFooter("certificate")}</span>
          </>
        )}
      </h3>
      <p className="text-[0.8125rem] leading-snug font-medium text-ink-soft">{t("subtitle")}</p>
      <p className="border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-muted-ink">
        {t("text")}
      </p>
    </Card>
  );
}
