import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a clock angle (0° = 12 o'clock, growing clockwise) into `left`/`top`
 * percentages on a square box, so orbit items land exactly on the ring instead
 * of being nudged into place by hand.
 */
export function polarPosition(angleDeg: number): { left: string; top: string } {
  const radians = ((angleDeg - 90) * Math.PI) / 180
  return {
    left: `${50 + 50 * Math.cos(radians)}%`,
    top: `${50 + 50 * Math.sin(radians)}%`,
  }
}

/**
 * Whether the catalogue has nothing left to sell of this product.
 *
 * `stock` is only present on products resolved from the API; the bundled static
 * catalogue has no inventory at all, and `undefined` there must not read as
 * zero or the offline storefront would show every product sold out. The admin
 * keeps listing a product with `stock: 0` as "Активный" — active means visible,
 * not orderable, and until this existed the storefront happily took the order.
 */
export function isSoldOut(product: { stock?: number }): boolean {
  return typeof product.stock === "number" && product.stock <= 0
}
