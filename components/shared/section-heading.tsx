import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "start" | "center";
  /** Renders the title in uppercase like the certificates / reviews blocks. */
  uppercase?: boolean;
  action?: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  uppercase = false,
  action,
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
        className
      )}
    >
      <div
        className={cn(
          "flex max-w-3xl flex-col gap-2",
          align === "center" && "items-center text-center"
        )}
      >
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase sm:text-sm">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className={cn(
            "font-heading text-[1.75rem] leading-[1.15] font-extrabold text-ink sm:text-4xl lg:text-[2.6rem]",
            uppercase && "uppercase"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-ink sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
