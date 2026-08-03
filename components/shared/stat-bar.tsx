import { cn } from "@/lib/utils";

export function StatBar({
  label,
  text,
  value,
  className,
}: {
  label: string;
  text: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[13rem_minmax(0,1fr)_2.75rem]", className)}>
      <div className="col-span-2 sm:col-span-1">
        <p className="font-heading text-[0.8125rem] font-extrabold text-ink uppercase">{label}</p>
        <p className="text-[0.6875rem] leading-snug text-muted-ink">{text}</p>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-brand-50"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-700 ease-brand"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-right text-[0.8125rem] font-bold text-ink tabular-nums">{value}%</span>
    </div>
  );
}
