import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  total = 5,
  className,
  starClassName,
}: {
  rating: number;
  total?: number;
  className?: string;
  starClassName?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`${rating} / ${total}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < rating ? "fill-star text-star" : "fill-white/40 text-white/40",
            starClassName
          )}
        />
      ))}
    </div>
  );
}
