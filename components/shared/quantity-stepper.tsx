"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  decreaseLabel,
  increaseLabel,
  label,
  size = "md",
  className,
}: QuantityStepperProps) {
  const buttonSize = size === "sm" ? "size-8" : "size-10";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white p-1",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={decreaseLabel}
        className={cn(
          buttonSize,
          "grid place-items-center rounded-md text-brand transition-colors hover:bg-brand-50 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        )}
      >
        <Minus className="size-4" />
      </button>
      <output
        aria-label={label}
        className={cn(
          "min-w-8 text-center text-sm font-bold text-ink tabular-nums",
          size === "sm" && "min-w-6"
        )}
      >
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={increaseLabel}
        className={cn(
          buttonSize,
          "grid place-items-center rounded-md text-brand transition-colors hover:bg-brand-50 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
