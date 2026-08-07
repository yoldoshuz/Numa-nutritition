"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/hooks";
import { Link } from "@/lib/i18n/navigation";

/**
 * Quantity picker plus the add button on a product page.
 *
 * Once the product is in the basket the button becomes a confirmation that
 * links through to the cart, and the stepper edits the line directly instead of
 * a local draft — so a second press adds to what is already there rather than
 * silently replacing it.
 */
export function ProductPurchase({ slug }: { slug: string }) {
  const t = useTranslations("Product");
  const tCommon = useTranslations("Common");
  const { add, setQuantity, lines, pending, ready } = useCart();

  const inCart = lines.find((line) => line.slug === slug)?.quantity ?? 0;
  const [draft, setDraft] = useState(1);

  const quantity = inCart > 0 ? inCart : draft;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QuantityStepper
        value={quantity}
        onChange={(next) => (inCart > 0 ? setQuantity(slug, next) : setDraft(next))}
        min={inCart > 0 ? 0 : 1}
        label={t("quantity")}
        decreaseLabel={t("decrease")}
        increaseLabel={t("increase")}
        className="self-start"
      />

      {ready && inCart > 0 ? (
        <Link
          href="/cart"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-brand bg-brand-50 px-8 text-sm font-bold text-brand-700 transition-colors duration-200 hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {t("added")}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => add(slug, draft)}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-8 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {tCommon("addToCart")}
        </button>
      )}
    </div>
  );
}
