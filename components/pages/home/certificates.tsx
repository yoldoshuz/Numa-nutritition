import { useTranslations } from "next-intl";

import { CertificateCard } from "@/components/shared/certificate-card";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { certificates } from "@/lib/data/content";

export function Certificates() {
  const t = useTranslations("Home.certificates");

  return (
    <section id="certificates" className="py-14 lg:py-20">
      <Container>
        <SectionHeading uppercase title={t("title")} description={t("description")} />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {certificates.map((certificate) => (
            <li key={certificate.id} className="h-full">
              <CertificateCard certificate={certificate} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
