import { useTranslations } from "next-intl";

import { Carousel } from "@/components/shared/carousel";
import { Container } from "@/components/shared/container";
import { ReviewCard } from "@/components/shared/review-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { reviews } from "@/lib/data/content";
import type { ReviewCardData } from "@/types";

/**
 * Customer reviews.
 *
 * `cards` is what the CMS published, already localised on the server; when it
 * is absent the bundled set renders instead.
 */
export function Reviews({ cards }: { cards?: ReviewCardData[] | null }) {
  const t = useTranslations("Home.reviews");

  return (
    <section id="reviews" className="py-14 lg:py-20">
      <Container>
        <SectionHeading uppercase title={t("title")} description={t("description")} />

        <Carousel
          label={t("title")}
          className="mt-8"
          itemClassName="w-[19rem] sm:w-[22rem] lg:w-[calc((100%-3rem)/3)]"
        >
          {(cards ?? reviews).map((entry, index) => {
            const fallback = reviews[index % reviews.length];
            const card = cards ? (entry as ReviewCardData) : undefined;
            return (
              <ReviewCard
                key={entry.id}
                review={card ? fallback : (entry as typeof fallback)}
                card={card}
                className="h-full"
              />
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}
