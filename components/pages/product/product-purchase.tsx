"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/hooks";

export function ProductPurchase({ slug }: { slug: string }) {
  const t = useTranslations("Product");
  const tCommon = useTranslations("Common");
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QuantityStepper
        value={quantity}
        onChange={setQuantity}
        label={t("quantity")}
        decreaseLabel={t("decrease")}
        increaseLabel={t("increase")}
        className="self-start"
      />
      <button
        type="button"
        onClick={() => {
          add(slug, quantity);
          setAdded(true);
        }}
        aria-live="polite"
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-8 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {added ? (
          <>
            <Check className="size-4" />
            {t("added")}
          </>
        ) : (
          tCommon("addToCart")
        )}
      </button>
    </div>
  );
}
