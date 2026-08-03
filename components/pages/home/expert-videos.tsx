import Image from "next/image";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";

import { Carousel } from "@/components/shared/carousel";
import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { SectionHeading } from "@/components/shared/section-heading";
import { expertVideos } from "@/lib/data/content";

export function ExpertVideos() {
  const t = useTranslations("Home.videos");

  return (
    <section id="videos" className="relative isolate py-14 lg:py-20">
      <LeafDecor position="right" />
      <Container>
        <SectionHeading title={t("title")} description={t("description")} />

        <Carousel
          label={t("title")}
          className="mt-8"
          itemClassName="w-[15rem] sm:w-[17rem] lg:w-[calc((100%-4.5rem)/4)]"
        >
          {expertVideos.map((video) => (
            <button
              key={video.id}
              type="button"
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Image
                src={video.poster}
                alt={t(`items.${video.id}`)}
                fill
                sizes="(max-width: 640px) 60vw, 300px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-brand shadow-float transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 size-5 fill-current" />
              </span>
              <span className="sr-only">{t("play")}</span>
            </button>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
