import Image from "next/image";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** `light` renders the white footer variant. */
  variant?: "brand" | "light";
  className?: string;
  label?: string;
  priority?: boolean;
}

/**
 * The wordmark on its own, with no link around it.
 *
 * The brand switcher wraps the logo in a `<button>`, and an anchor inside a
 * button is invalid markup — the browser hands the click to the anchor, so the
 * logo navigated home instead of opening the group menu that is the whole point
 * of the control. Anything supplying its own interactive element takes this;
 * everything else takes `<Logo>` below.
 */
export function LogoMark({
  variant = "brand",
  className,
  label = "NUMA Nutrition",
  priority = false,
}: LogoProps) {
  return (
    <Image
      src="/logoss-01 1.png"
      alt={label}
      width={232}
      height={68}
      priority={priority}
      sizes="232px"
      className={cn(
        "h-9 w-auto sm:h-11 lg:h-12",
        // The source artwork is teal; the footer needs it knocked out to white.
        variant === "light" && "brightness-0 invert",
        className
      )}
    />
  );
}

export function Logo({
  variant = "brand",
  className,
  label = "NUMA Nutrition",
  priority = false,
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
        className
      )}
    >
      <LogoMark variant={variant} label={label} priority={priority} />
    </Link>
  );
}
