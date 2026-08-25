import type {
  BenefitWheelItem,
  BlogPost,
  Certificate,
  ExpertVideo,
  NavLink,
  Review,
  SocialLink,
} from "@/types";

export const mainNav: NavLink[] = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "blog", href: "/blog" },
  { key: "contacts", href: "/contacts" },
];

export const directionLinks: NavLink[] = [
  { key: "family", href: "https://numafamily.uz" },
  { key: "kids", href: "https://numafamily.uz" },
  { key: "nabaviy", href: "https://numafamily.uz" },
  { key: "diagnostics", href: "https://numafamily.uz" },
  { key: "bettery", href: "https://numafamily.uz" },
];

export const companyLinks: NavLink[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/#why" },
  { key: "news", href: "/blog" },
  { key: "video", href: "/#videos" },
  { key: "reviews", href: "/#reviews" },
  { key: "certificates", href: "/#certificates" },
  { key: "contacts", href: "/contacts" },
];

export const socialLinks: SocialLink[] = [
  { key: "telegram", href: "https://t.me/Numa_uz_admin", icon: "telegram" },
  { key: "website", href: "https://numafamily.uz", icon: "web" },
  { key: "instagram", href: "https://www.instagram.com/numa.uz", icon: "instagram" },
];

/**
 * The four NUMA properties, surfaced from the logo dropdown.
 *
 * Every site carries the whole list including itself, so the menu reads the
 * same everywhere and a visitor can always see where they currently are. The
 * logos live in each site's own `public/brands/` — copied rather than
 * hot-linked, so a neighbour being down never leaves a hole in this menu.
 *
 * These are the deploy URLs, not the brand domains: numafamily.uz,
 * numanutrition.uz and nabaviytabobat.uz do not resolve yet, and a dropdown of
 * dead links is worse than no dropdown. Swap them the day DNS is cut over.
 */
export const SIBLING_SITES = [
  {
    id: "nutrition",
    label: "NUMA NUTRITION",
    href: "https://numa-nutritition.vercel.app",
    logo: "/brands/nutrition.png",
  },
  {
    id: "kids",
    label: "NUMA KIDS",
    href: "https://numa-kids-olive.vercel.app/ru",
    logo: "/brands/kids.png",
  },
  {
    id: "family",
    label: "NUMA FAMILY",
    href: "https://numa-family.vercel.app/ru",
    logo: "/brands/family.png",
  },
  {
    id: "tabobat",
    label: "NABAVIY TABOBAT",
    href: "https://nabaviy-tabobat.vercel.app",
    logo: "/brands/tabobat.png",
  },
] as const;


export const contactInfo = {
  phone: "+998 55 513 33 33",
  phoneHref: "tel:+998555133333",
  /*
   * Group-wide handles. The tester round found the per-brand ones dead: the
   * Instagram account was never registered and the Telegram username resolves
   * to nothing. @Numa_uz_admin is the shared admin answering for all four NUMA
   * sites, so it reads the same in every repo.
   */
  instagram: "@numa.uz",
  instagramHref: "https://www.instagram.com/numa.uz",
  telegram: "@Numa_uz_admin",
  telegramHref: "https://t.me/Numa_uz_admin",
  email: "numafamilyuz@gmail.com",
  emailHref: "mailto:numafamilyuz@gmail.com",
  site: "www.numafamily.uz",
  siteHref: "https://numafamily.uz",
  mapImage: "/Rectangle 107.png",
  /**
   * Keyless Yandex widget, resolved from the office address instead of a fixed
   * pin — the old coordinate sat in the city centre, not in Yashnabod. No `geo`
   * block until the exact point is surveyed: wrong coordinates in structured
   * data send couriers to the wrong door.
   */
  mapEmbed:
    "https://yandex.uz/map-widget/v1/?text=%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%2C%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%AD%D0%BB%D0%B1%D0%B5%D0%BA%2C%2031&z=17&lang=ru_RU",
  mapHref: "https://yandex.uz/maps/10335/tashkent/?text=%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%2C%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%AD%D0%BB%D0%B1%D0%B5%D0%BA%2C%2031&z=17",
} as const;

/** The five promises rendered in the strip right under the hero. */
export const heroFeatures = [
  { key: "natural", icon: "leaf" },
  { key: "production", icon: "factory" },
  { key: "standards", icon: "globe" },
  { key: "quality", icon: "shield-check" },
  { key: "support", icon: "heart-pulse" },
] as const;

export const benefitWheel: BenefitWheelItem[] = [
  { id: "immunity", icon: "/image_2026-07-07_10-31-20-Photoroom 2.png", position: "top" },
  { id: "digestion", icon: "/image_2026-07-07_10-29-31-Photoroom 2.png", position: "left-top" },
  { id: "beauty", icon: "/image_2026-07-07_10-35-17-Photoroom 2.png", position: "left-bottom" },
  { id: "detox", icon: "/Vector-1.png", position: "right-top" },
  { id: "energy", icon: "/Vector-2.png", position: "right-bottom" },
  { id: "heart", icon: "/Vector.png", position: "bottom" },
];

export const companyStats = ["clients", "products", "partners", "since"] as const;

export const expertVideos: ExpertVideo[] = [
  { id: "shaykhova", poster: "/Rectangle 61.png" },
  { id: "detox", poster: "/Rectangle 61-1.png" },
  { id: "entrepreneur", poster: "/Rectangle 61-2.png" },
  { id: "beauty", poster: "/Rectangle 61-3.png" },
];

export const certificates: Certificate[] = [
  { id: "euroleaf", icon: "/Ellipse 254.png" },
  { id: "halal", icon: "/Ellipse 255.png" },
  { id: "usda", icon: "/Ellipse 256.png" },
  { id: "iso", icon: "/Ellipse 257.png" },
  { id: "gmp", icon: "/Ellipse 258.png" },
];

export const reviews: Review[] = [
  { id: "akbar", avatar: "/Container.png", rating: 5 },
  { id: "malika", avatar: "/Container-1.png", rating: 5 },
  { id: "sanjar", avatar: "/Container-2.png", rating: 4 },
  { id: "dilnoza", avatar: "/Container-1.png", rating: 5 },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "how-numa-products-are-made",
    category: "production",
    date: "2026-06-12",
    readingMinutes: 4,
    cover: "/Rectangle 148.png",
    figures: ["/Rectangle 118-2.png", "/Rectangle 118-6.png"],
    featured: true,
  },
  {
    slug: "scientific-approach",
    category: "expert",
    date: "2026-06-26",
    readingMinutes: 5,
    cover: "/Rectangle 148-1.png",
    figures: ["/image 249.png", "/image 250.png", "/image 251.png"],
    featured: true,
  },
  {
    slug: "international-recognition",
    category: "achievements",
    date: "2026-05-30",
    readingMinutes: 3,
    cover: "/Rectangle 148-2.png",
    figures: ["/Rectangle 118.png", "/Rectangle 118-5.png"],
    featured: true,
  },
  {
    slug: "normal-hemoglobin-level",
    category: "products",
    date: "2026-05-14",
    readingMinutes: 6,
    cover: "/Rectangle 118-7.png",
    figures: ["/Rectangle 118-8.png"],
    featured: false,
  },
  {
    slug: "expanding-geography",
    category: "international",
    date: "2026-04-22",
    readingMinutes: 4,
    cover: "/Rectangle 118-3.png",
    figures: ["/Rectangle 118-1.png"],
    featured: false,
  },
];

export const blogSlugs = blogPosts.map((post) => post.slug);

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  return blogPosts.filter((post) => post.slug !== slug).slice(0, limit);
}
