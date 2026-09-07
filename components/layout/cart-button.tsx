"use client";

import { ShoppingCart, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAuth, useCart } from "@/hooks";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * One control in the header, not two.
 *
 * A visitor without an account has nothing to go to but the basket, so that is
 * what the button is. Once someone is signed in the basket stops being a
 * destination of its own — it lives inside the account alongside their orders —
 * and the button becomes the way in there. The badge follows the basket either
 * way, so the count is never hidden by being signed in.
 *
 * While the stored session is still being checked the control stays on the
 * basket: that is the safe default, and the account screen would only send an
 * anonymous visitor back to the login page anyway.
 */
export function CartButton({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const tAccount = useTranslations("Account");
  const { count, ready } = useCart();
  const { status } = useAuth();

  const signedIn = status === "authenticated";
  const badge = ready && count > 0 ? (count > 99 ? "99+" : String(count)) : null;

  return (
    <Link
      href={signedIn ? "/account" : "/cart"}
      aria-label={
        signedIn ? tAccount("account") : ready ? t("cartCount", { count }) : t("cart")
      }
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-lg bg-brand text-white transition-all duration-200 hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
    >
      {signedIn ? (
        <User className="size-[1.15rem]" />
      ) : (
        <ShoppingCart className="size-[1.15rem]" />
      )}
      {badge ? (
        <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[0.625rem] leading-5 font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
