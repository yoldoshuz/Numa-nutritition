import Image from "next/image";

import { cn } from "@/lib/utils";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Real tea-leaf cut-outs from the Figma export. */
const leaves: Record<Corner, { src: string; className: string }> = {
  "top-left": {
    src: "/image 223-1.png",
    className: "-top-6 -left-10 w-28 -rotate-12 sm:w-40 lg:-left-16 lg:w-52",
  },
  "top-right": {
    src: "/image 224-1.png",
    className: "-top-10 -right-8 w-28 rotate-6 sm:w-40 lg:-right-14 lg:w-56",
  },
  "bottom-left": {
    src: "/image 222.png",
    className: "bottom-4 -left-8 w-24 rotate-[18deg] sm:w-32 lg:-left-12 lg:w-44",
  },
  "bottom-right": {
    src: "/image 223.png",
    className: "-right-8 bottom-0 w-24 -rotate-[24deg] sm:w-32 lg:-right-12 lg:w-44",
  },
};

interface LeafDecorProps {
  className?: string;
  /** Which corners get a leaf. */
  corners?: Corner[];
  /** Legacy shorthand kept so existing sections stay declarative. */
  position?: "left" | "right" | "both";
}

const presets: Record<NonNullable<LeafDecorProps["position"]>, Corner[]> = {
  left: ["top-left", "bottom-left"],
  right: ["top-right", "bottom-right"],
  both: ["top-left", "bottom-right"],
};

export function LeafDecor({ className, corners, position = "both" }: LeafDecorProps) {
  const active = corners ?? presets[position];

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {active.map((corner) => (
        <Image
          key={corner}
          src={leaves[corner].src}
          alt=""
          width={360}
          height={560}
          sizes="(max-width: 640px) 30vw, 220px"
          className={cn("absolute h-auto select-none", leaves[corner].className)}
        />
      ))}
    </div>
  );
}
