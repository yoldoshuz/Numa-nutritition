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
  { key: "telegram", href: "https://t.me/numanutrition", icon: "telegram" },
  { key: "website", href: "https://numafamily.uz", icon: "web" },
  { key: "instagram", href: "https://instagram.com/numa_nutrition", icon: "instagram" },
];

export const contactInfo = {
  phone: "+998 71 203-22-32",
  phoneHref: "tel:+998712032232",
  instagram: "@numa_nutrition",
  instagramHref: "https://instagram.com/numa_nutrition",
  telegramHref: "https://t.me/numanutrition",
  email: "info@numanutrition.uz",
  emailHref: "mailto:info@numanutrition.uz",
  site: "www.numafamily.uz",
  siteHref: "https://numafamily.uz",
  mapImage: "/Rectangle 107.png",
  /** Keyless Yandex widget embed centred on the Tashkent office. */
  mapEmbed:
    "https://yandex.uz/map-widget/v1/?ll=69.279700%2C41.311100&z=16&pt=69.279700,41.311100,pm2rdm&lang=ru_RU",
  mapHref: "https://yandex.uz/maps/10335/tashkent/?ll=69.279700%2C41.311100&z=16",
  geo: { latitude: 41.3111, longitude: 69.2797 },
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
