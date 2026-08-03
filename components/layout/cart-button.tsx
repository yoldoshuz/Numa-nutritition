"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

import { useCart } from "@/hooks";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={ready ? t("cartCount", { count }) : t("cart")}
      className={cn(
        "relative grid size-10 place-items-center rounded-full bg-brand text-white transition-all duration-200 hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className
      )}
    >
      <ShoppingCart className="size-[1.15rem]" />
      {ready && count > 0 ? (
        <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[0.625rem] leading-5 font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
