import Image from "next/image";
import { useTranslations } from "next-intl";

import { RatingStars } from "@/components/shared/rating-stars";
import { cn } from "@/lib/utils";
import type { Review, ReviewCardData } from "@/types";

/**
 * One review card.
 *
 * Takes copy already resolved by the caller when the CMS supplied it, and falls
 * back to the bundled translation keyed by `id` when it did not.
 */
export function ReviewCard({
  review,
  card,
  className,
}: {
  review: Review;
  card?: ReviewCardData;
  className?: string;
}) {
  const t = useTranslations(`Home.reviews.items.${review.id}`);

  return (
    <figure
      className={cn(
        "flex h-full flex-col gap-4 rounded-2xl bg-brand p-6 text-white shadow-card sm:p-7",
        className
      )}
    >
      <RatingStars rating={card?.rating ?? review.rating} />
      <blockquote className="flex-1 text-[0.875rem] leading-relaxed text-white/95">
        {card?.text ?? t("text")}
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <Image
          src={card?.avatar ?? review.avatar}
          alt=""
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-full border-2 border-white/70 object-cover"
        />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold">{card?.name ?? t("name")}</span>
          <span className="text-xs text-white/80">{card ? card.location : t("location")}</span>
        </span>
      </figcaption>
    </figure>
  );
}
