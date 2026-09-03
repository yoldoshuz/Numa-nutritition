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
          {expertVideos.map((video) => {
            /*
             * A card only behaves like a player when there is something to
             * play. These were all `<button>`s with no handler behind them, so
             * every poster showed a play badge and did nothing when clicked.
             */
            const Tag = video.href ? "a" : "figure";
            /*
             * Channel clips carry their own published title; the four
             * commissioned for this site have a translated caption instead.
             */
            const caption = video.title ?? t(`items.${video.id}`);
            return (
            <Tag
              key={video.id}
              {...(video.href
                ? { href: video.href, target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Image
                src={video.poster}
                alt={caption}
                fill
                sizes="(max-width: 640px) 60vw, 300px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {video.href ? (
                <>
                  <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-brand shadow-float transition-transform duration-300 group-hover:scale-110">
                    <Play className="ml-0.5 size-5 fill-current" />
                  </span>
                  <span className="sr-only">{t("play")}</span>
                </>
              ) : null}
              {/* The title over the poster, so a shelf of fourteen clips is
                  something you can read rather than fourteen stills to guess
                  at. The gradient above it is what keeps it legible. */}
              <span className="absolute inset-x-0 bottom-0 p-3">
                <span className="line-clamp-2 text-[0.75rem] leading-snug font-semibold text-white">
                  {caption}
                </span>
              </span>
            </Tag>
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}
