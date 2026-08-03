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
          variant === "light" && "brightness-0 invert"
        )}
      />
    </Link>
  );
}
