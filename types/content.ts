export type BlogCategory = "production" | "expert" | "achievements" | "products" | "international";

export interface BlogPost {
  slug: string;
  category: BlogCategory;
  /** ISO date, used for `datePublished` and the article meta line. */
  date: string;
  readingMinutes: number;
  cover: string;
  /** Optional gallery rendered inside the article body. */
  figures?: string[];
  featured: boolean;
}

export interface Certificate {
  id: string;
  icon: string;
}

export interface ExpertVideo {
  id: string;
  poster: string;
  /** External video URL — wired to the backend later. */
  href?: string;
}

export interface Review {
  id: string;
  avatar: string;
  rating: number;
}

export interface BenefitWheelItem {
  id: string;
  icon: string;
  /** Position of the item around the ring on desktop. */
  position: "top" | "left-top" | "left-bottom" | "right-top" | "right-bottom" | "bottom";
}

export interface NavLink {
  key: string;
  href: string;
}

export interface SocialLink {
  key: string;
  href: string;
  icon: "telegram" | "web" | "instagram";
}
