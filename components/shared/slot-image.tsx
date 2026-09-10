import Image from "next/image";

import { SLOT_ASPECT, slotOf, type ProductImages } from "@/lib/product-images";
import type { ImageSlotKey } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface SlotImageProps {
  images: ProductImages | undefined;
  slot: ImageSlotKey;
  alt: string;
  sizes: string;
  priority?: boolean;
  /**
   * `cover` fills the frame and is safe here because the frame carries the
   * slot's own ratio; `contain` letterboxes, for a packshot that has to keep
   * its whole silhouette.
   */
  fit?: "cover" | "contain";
  /** Classes for the frame — rounding, plate colour, grid placement. */
  className?: string;
  /** Classes for the picture itself. */
  imageClassName?: string;
}

/**
 * The picture placed in one named slot, in a frame cut to that slot's shape.
 *
 * Renders nothing at all when the slot is empty. That is the whole point: a
 * section with no photo of its own is a section of text, and the alternative —
 * borrowing a gallery frame or reaching for a bundled placeholder — puts a
 * picture of something else on the page and reads as "this product has no
 * photographs".
 *
 * The frame states the ratio and the picture carries the slot's specified
 * dimensions, so the box holds its place while the file loads rather than
 * shoving the rest of the section down when it arrives.
 */
export function SlotImage({
  images,
  slot,
  alt,
  sizes,
  priority,
  fit = "contain",
  className,
  imageClassName,
}: SlotImageProps) {
  const image = slotOf(images, slot);
  if (!image) return null;

  return (
    <div className={cn("relative overflow-hidden", SLOT_ASPECT[slot], className)}>
      <Image
        src={image.url}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        className={cn(
          "h-full w-full",
          fit === "cover" ? "object-cover" : "object-contain",
          imageClassName,
        )}
      />
    </div>
  );
}

/**
 * A placed picture used as a section's backdrop — `hero_bg` and nothing else so
 * far.
 *
 * No frame and no ratio: a backdrop takes the shape of whatever it sits behind,
 * so this one covers. Absent, the section keeps the brand fill it is painted
 * with, which is what the design specifies for a product with no backdrop.
 */
export function SlotBackground({
  images,
  slot,
  className,
}: Pick<SlotImageProps, "images" | "slot" | "className">) {
  const image = slotOf(images, slot);
  if (!image) return null;

  return (
    <Image
      src={image.url}
      alt=""
      aria-hidden
      fill
      sizes="100vw"
      className={cn("-z-10 object-cover", className)}
    />
  );
}
