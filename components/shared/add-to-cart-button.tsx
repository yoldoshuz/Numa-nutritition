"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { useCart } from "@/hooks";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  slug: string;
  quantity?: number;
  label: string;
  addedLabel: string;
  className?: string;
}

export function AddToCartButton({
  slug,
  quantity = 1,
  label,
  addedLabel,
  className,
}: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        add(slug, quantity);
        setAdded(true);
      }}
      aria-live="polite"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className
      )}
    >
      {added ? (
        <>
          <Check className="size-4" />
          <span className="truncate">{addedLabel}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
