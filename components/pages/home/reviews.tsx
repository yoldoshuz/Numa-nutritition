import { useTranslations } from "next-intl";

import { Carousel } from "@/components/shared/carousel";
import { Container } from "@/components/shared/container";
import { ReviewCard } from "@/components/shared/review-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { reviews } from "@/lib/data/content";

export function Reviews() {
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
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} className="h-full" />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
