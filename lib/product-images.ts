/**
 * Product photography addressed by the place it fills on the page.
 *
 * Which photo appeared in which section used to be an accident of upload order:
 * every block dressed itself from one unordered pile by index, so the frame
 * beside the instructions was whichever file happened to land third, and the
 * same picture turned up in four boxes on one screen. The backend answers with
 * a complete map of named places instead — `benefits_1`, `how_to_use_1`,
 * `certificate_1` — and this module is the only thing that reads it.
 *
 * The rule the whole page follows: a section asks for the slot that carries its
 * own name, and an empty slot means the section renders without a picture. Not
 * a borrowed gallery frame, and never a bundled placeholder — a stock image on
 * a product card is a photograph of something the customer is not buying.
 */

import { resolveMediaUrl } from "@/lib/api/media";
import {
  PRODUCT_IMAGE_SLOTS,
  type ApiImageSlot,
  type ApiImageSlots,
  type ImageSlotKey,
} from "@/lib/api/types";

/**
 * The slot list itself, re-exported so this module is the one import a caller
 * needs: the names, the types and the rules all arrive from the same place.
 */
export { PRODUCT_IMAGE_SLOTS };

/**
 * One placed picture. `width`/`height` are the slot's specification rather than
 * the file's own size, which is what a layout needs: the box can hold its shape
 * before the bytes arrive, so the page does not jump when they land.
 */
export type ProductImage = ApiImageSlot;

/** All fifteen places, an unfilled one being `null`. */
export type ProductImages = Record<ImageSlotKey, ProductImage | null>;

/** Nothing placed anywhere — the shape a product has before the API answers. */
export const EMPTY_PRODUCT_IMAGES: ProductImages = Object.fromEntries(
  PRODUCT_IMAGE_SLOTS.map((slot) => [slot, null]),
) as ProductImages;

/**
 * Folds the API's `images` map onto resolved URLs, keeping every key.
 *
 * A slot whose file cannot be resolved is levelled to `null` rather than kept
 * as a picture with an empty `src`, so "is there a photo here" stays a single
 * question with a single answer.
 */
export function toProductImages(images: ApiImageSlots | undefined): ProductImages {
  return Object.fromEntries(
    PRODUCT_IMAGE_SLOTS.map((slot) => {
      const image = images?.[slot];
      const url = resolveMediaUrl(image?.url);
      return [slot, image && url ? { ...image, url } : null];
    }),
  ) as ProductImages;
}

/** The four gallery places, in the order the slider stacks them. */
export const GALLERY_SLOTS = [
  "gallery_1",
  "gallery_2",
  "gallery_3",
  "gallery_4",
] as const;

/**
 * The slider's frames: the gallery slots that have a photo, in slot order.
 *
 * Compacted rather than padded — a moderator who filled the first and the third
 * asked for two slides, not for a gap in the middle. `gallery_1` is the only
 * slot the catalogue insists on: it is the card photo, the cart thumbnail and
 * the first frame here.
 */
export function galleryOf(images: ProductImages | undefined): ProductImage[] {
  const placed = images ?? EMPTY_PRODUCT_IMAGES;
  return GALLERY_SLOTS.map((slot) => placed[slot]).filter(
    (image): image is ProductImage => image !== null,
  );
}

/** The picture in one named place, or `null` — the caller's cue to render none. */
export function slotOf(
  images: ProductImages | undefined,
  slot: ImageSlotKey,
): ProductImage | null {
  return (images ?? EMPTY_PRODUCT_IMAGES)[slot];
}

/** Whether any of the given places has a photo — for a section that is all photo. */
export function hasSlots(
  images: ProductImages | undefined,
  ...slots: ImageSlotKey[]
): boolean {
  return slots.some((slot) => slotOf(images, slot) !== null);
}

/**
 * The shape each slot is shot in.
 *
 * The container takes its ratio from the slot, never from the design's
 * convenience. Boxes cut to an arbitrary strip are what made three of these
 * pages look broken: a 4:3 photo in a 964×301 frame, a square one in 1200×525,
 * another square in 544×254 — `object-cover` then keeps a band across the
 * middle of the label and drops the rest. A layout that genuinely wants a
 * letterbox has a slot for it, `banner_wide`, which is shot 3:1.
 */
export const SLOT_ASPECT: Record<ImageSlotKey, string> = {
  gallery_1: "aspect-square",
  gallery_2: "aspect-square",
  gallery_3: "aspect-square",
  gallery_4: "aspect-square",
  hero_bg: "aspect-video",
  about_1: "aspect-[4/3]",
  benefits_1: "aspect-[4/3]",
  benefits_2: "aspect-[4/3]",
  how_to_use_1: "aspect-[4/3]",
  composition_1: "aspect-square",
  metrics_1: "aspect-[4/3]",
  advantages_1: "aspect-[4/3]",
  lifestyle_1: "aspect-video",
  certificate_1: "aspect-[3/4]",
  banner_wide: "aspect-[3/1]",
};
