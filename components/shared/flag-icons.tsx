import type { SVGProps } from "react";

import type { AppLocale } from "@/types";

/**
 * Inline flags — emoji regional indicators do not render as flags on Windows,
 * so the switcher ships its own vector marks.
 */
function RuFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" {...props}>
      <rect width="24" height="16" rx="2.5" fill="#fff" />
      <path d="M0 5.334h24v5.333H0z" fill="#0039A6" />
      <path d="M0 10.667h24v2.833A2.5 2.5 0 0 1 21.5 16h-19A2.5 2.5 0 0 1 0 13.5z" fill="#D52B1E" />
      <rect width="24" height="16" rx="2.5" fill="none" stroke="rgb(0 0 0 / 0.08)" />
    </svg>
  );
}

function GbFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" {...props}>
      <rect width="24" height="16" rx="2.5" fill="#012169" />
      <path d="m0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="m0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.9" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.2" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3.1" />
      <rect width="24" height="16" rx="2.5" fill="none" stroke="rgb(0 0 0 / 0.08)" />
    </svg>
  );
}

function UzFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" {...props}>
      <rect width="24" height="16" rx="2.5" fill="#1EB53A" />
      <path d="M0 2.5A2.5 2.5 0 0 1 2.5 0h19A2.5 2.5 0 0 1 24 2.5V5.4H0z" fill="#0099B5" />
      <path d="M0 5.4h24v5.2H0z" fill="#fff" />
      <path d="M0 5.1h24v.6H0zM0 10.3h24v.6H0z" fill="#CE1126" />
      <circle cx="4.6" cy="2.6" r="1.5" fill="#fff" />
      <circle cx="5.5" cy="2.6" r="1.5" fill="#0099B5" />
      <rect width="24" height="16" rx="2.5" fill="none" stroke="rgb(0 0 0 / 0.08)" />
    </svg>
  );
}

export const flagIcons: Record<AppLocale, (props: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  ru: RuFlag,
  en: GbFlag,
  uz: UzFlag,
};
