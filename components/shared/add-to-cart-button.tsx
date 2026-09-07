"use client";

import { useTranslations } from "next-intl";

import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/hooks";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  slug: string;
  quantity?: number;
  label: string;
  className?: string;
  /** Nothing left in stock — the control is shown, disabled, in its place. */
  soldOut?: boolean;
}

/**
 * "Buy" until the product is in the cart, then an inline quantity stepper.
 *
 * Both states occupy the same box: the previous implementation swapped the
 * label for a much longer confirmation string, which widened the button and
 * pushed the neighbouring "Details" link out of the card. Rendering a
 * fixed-width control instead keeps every card in the grid aligned, and gives
 * the shopper somewhere to adjust the quantity without opening the cart.
 *
 * Stepping down from 1 drops the line and returns the button to its "Buy"
 * state, which is why `min` is 0 rather than the stepper's default.
 */
export function AddToCartButton({
  slug,
  quantity = 1,
  label,
  className,
  soldOut = false,
}: AddToCartButtonProps) {
  const { add, setQuantity, lines, ready } = useCart();
  const t = useTranslations("Product");
  const tCommon = useTranslations("Common");

  const inCart = lines.find((line) => line.slug === slug)?.quantity ?? 0;

  /*
   * Sold out outranks everything, including a line already in the basket: the
   * stock ran out while the shopper was browsing and the honest answer is that
   * it cannot be ordered, not a stepper that pretends it can.
   */
  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-line bg-line/30 px-5 text-sm font-semibold text-muted-ink",
          className,
        )}
      >
        <span className="truncate">{tCommon("outOfStock")}</span>
      </button>
    );
  }

  // Before hydration the cart is empty on both sides of the boundary, so the
  // button always renders first and never mismatches during SSR.
  if (ready && inCart > 0) {
    return (
      <QuantityStepper
        value={inCart}
        onChange={(next) => setQuantity(slug, next)}
        min={0}
        size="sm"
        label={t("quantity")}
        decreaseLabel={t("decrease")}
        increaseLabel={t("increase")}
        // The caller sizes the slot; the trailing padding wins over any `px-*`
        // meant for the button label, so the stepper's arrows stay inside it.
        className={cn("justify-between", className, "px-1")}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => add(slug, quantity)}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
