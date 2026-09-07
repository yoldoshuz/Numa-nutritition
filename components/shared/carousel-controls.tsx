"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface CarouselControlsProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  prevLabel: string;
  nextLabel: string;
  className?: string;
}

const button =
  "grid size-11 place-items-center rounded-full border border-brand-200 bg-white text-brand shadow-card transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white active:translate-y-px disabled:pointer-events-none disabled:border-line disabled:text-muted-ink/40 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function CarouselControls({
  onPrev,
  onNext,
  canPrev,
  canNext,
  prevLabel,
  nextLabel,
  className,
}: CarouselControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label={prevLabel}
        className={button}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label={nextLabel}
        className={button}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
