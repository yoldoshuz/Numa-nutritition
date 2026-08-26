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

/**
 * Footer "directions" — the other NUMA properties.
 *
 * Every one of these pointed at numafamily.uz, which does not resolve, so the
 * whole column led to a browser error page. They now go where the logo dropdown
 * goes: the live deploys. Diagnostics and Bettery have no site of their own
 * yet, so they land on Family rather than nowhere.
 */
export const directionLinks: NavLink[] = [
  { key: "family", href: "https://numa-family.vercel.app/ru" },
  { key: "kids", href: "https://numa-kids-olive.vercel.app/ru" },
  { key: "nabaviy", href: "https://nabaviy-tabobat.vercel.app" },
  { key: "diagnostics", href: "https://numa-family.vercel.app/ru" },
  { key: "bettery", href: "https://numa-family.vercel.app/ru" },
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
  { key: "telegram", href: "https://t.me/numa_uz", icon: "telegram" },
  { key: "instagram", href: "https://www.instagram.com/numa.uz", icon: "instagram" },
  { key: "facebook", href: "https://www.facebook.com/share/1EVPsKHEgL/", icon: "facebook" },
  { key: "website", href: "https://numafamily.uz", icon: "web" },
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
   * Two Telegram destinations, and they are not interchangeable. `telegram` is
   * the public channel — footers, the contact card, structured data, anywhere
   * the site is just saying where to find the brand. `telegramAdmin` is a
   * person and belongs only behind a button offering to carry on a
   * conversation. Dropping someone from a footer icon into a private chat with
   * an administrator is what split these apart.
   */
  instagram: "@numa.uz",
  instagramHref: "https://www.instagram.com/numa.uz",
  telegram: "@numa_uz",
  telegramHref: "https://t.me/numa_uz",
  telegramAdmin: "@Numa_uz_admin",
  telegramAdminHref: "https://t.me/Numa_uz_admin",
  facebookHref: "https://www.facebook.com/share/1EVPsKHEgL/",
  email: "numafamilyuz@gmail.com",
  emailHref: "mailto:numafamilyuz@gmail.com",
  site: "www.numafamily.uz",
  // The brand domain does not resolve yet; the footer link has to work today.
  siteHref: "https://numa-family.vercel.app/ru",
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

/**
 * Four clips from the brand's own channel, youtube.com/@NUMAUZ.
 *
 * The section shipped with four Figma placeholders and no `href`, so it was a
 * wall of stills with nothing behind them. These are real videos, chosen for a
 * spread of subjects — a specialist to camera, the product in hand, an everyday
 * meal, and one on iodine — rather than four takes on the same shot.
 *
 * Posters are cropped and served from `public/video/` rather than hotlinked to
 * `i.ytimg.com`: `next.config.ts` only allows the backend as a remote image
 * host, and every clip is a Short, so YouTube's own thumbnail is the 9:16 frame
 * letterboxed into a 16:9 box — pointing this 3:4 card at it would fill most of
 * the card with black bars. The file name is the video id, so the poster and
 * the link can never drift apart.
 */
export const expertVideos: ExpertVideo[] = [
  {
    id: "specialist",
    poster: "/video/1Bydz-O-r88.jpg",
    href: "https://www.youtube.com/shorts/1Bydz-O-r88",
  },
  {
    id: "detox",
    poster: "/video/5InExXEyNQI.jpg",
    href: "https://www.youtube.com/shorts/5InExXEyNQI",
  },
  {
    id: "nutrition",
    poster: "/video/6ZrtnjrqmOg.jpg",
    href: "https://www.youtube.com/shorts/6ZrtnjrqmOg",
  },
  {
    id: "iodine",
    poster: "/video/xXmN2f7wyuM.jpg",
    href: "https://www.youtube.com/shorts/xXmN2f7wyuM",
  },
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
