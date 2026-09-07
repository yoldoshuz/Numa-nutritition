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
  /** Where the clip plays. A card with no link is a poster, not a player. */
  href?: string;
  /**
   * The clip's own published title.
   *
   * Set on the videos the channel published rather than commissioned for this
   * site, and deliberately not translated: it is what YouTube shows, so a
   * Russian rendering would promise a Russian-language clip that does not
   * exist. When absent the caption comes from `Home.videos.items.<id>`.
   */
  title?: string;
}

export interface Review {
  id: string;
  avatar: string;
  rating: number;
}

/**
 * A review as the section renders it, already in the reader's language.
 *
 * Resolved on the server so the card never has to know whether the text came
 * from the CMS or from the bundled fallback.
 */
export interface ReviewCardData {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
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
  icon: "telegram" | "web" | "instagram" | "facebook";
}
