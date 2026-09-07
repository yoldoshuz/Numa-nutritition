"use client";

import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The way in for someone without an account.
 *
 * Renders only while anonymous: once there is a session the merged
 * cart/account control beside it already leads to the account, and two doors to
 * the same room is one too many. Hidden below `sm`, where the burger menu
 * carries the same link.
 */
export function LoginButton({
  className,
  compact = false,
}: {
  className?: string;
  /** Icon only — the phone bar has no room for a worded button. */
  compact?: boolean;
}) {
  const t = useTranslations("Account");
  const { status } = useAuth();

  if (status !== "anonymous") return null;

  return (
    <Link
      href="/login"
      className={cn(compact ? "grid h-10 w-10 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-brand-200 hover:text-brand-700" : "hidden h-10 items-center justify-center rounded-lg border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-200 hover:text-brand-700 sm:inline-flex", className)}
      aria-label={t("signInTab")}
    >
      {compact ? <LogIn className="size-[1.15rem]" aria-hidden /> : t("signInTab")}
    </Link>
  );
}
