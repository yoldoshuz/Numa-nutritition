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
