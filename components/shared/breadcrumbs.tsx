import { ChevronRight } from "lucide-react";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs text-muted-ink", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-brand">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-muted-ink/70">
                {item.name}
              </span>
            )}
            {index < items.length - 1 ? (
              <ChevronRight className="size-3 text-muted-ink/50" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
