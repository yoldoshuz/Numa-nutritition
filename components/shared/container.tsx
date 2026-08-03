import { cn } from "@/lib/utils";

/** Page gutter used by every section — 1296px content width, as in Figma. */
export function Container({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-page px-5 sm:px-8 lg:px-12", className)}
      {...props}
    >
      {children}
    </div>
  );
}
