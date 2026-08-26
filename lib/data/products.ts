import type { Product } from "@/types";

/**
 * Image paths point at the exported Figma assets that already live in `public/`.
 * Filenames contain spaces and parentheses, so they are encoded where needed by
 * `next/image` automatically.
 *
 * Every slot below must show THIS product. The Figma export dropped a set of
 * generically-named frames (`Rectangle 1700-5`, `Rectangle 1702-7`, …) into
 * `public/` and the catalogue was first wired up by number rather than by what
 * is in the frame, so several products ended up borrowing Cardio Control's
 * lifestyle shoot and two carried the pre-redesign 330 ml bottles. A reviewer
 * caught it on the Black Honey, Collagen PRO+, Omega 3-6-9, Insulin Balance and
 * Hemoglobin+ pages. Before pointing a slot at one of those frames, open the
 * file — the number says nothing about which bottle is in it.
 *
 * Products with no lifestyle shoot of their own (the jars, and Igneus) repeat
 * their packshot across the composition slots. That is deliberate: a packshot
 * shown twice is honest, another product's photo is not. `gallery` and
 * `benefitSlides` use the path as a React key, so those two arrays must stay
 * free of duplicates — `usage` may repeat a file.
 */
export const products: Product[] = [
  {
    slug: "cardio-control",
    name: "Cardio Control",
    price: 400000,
    badge: "hit",
    form: "syrup",
    image: "/Asset 3 (3) 1.png",
    hero: "/Rectangle 1699.png",
    gallery: ["/Asset 1 1-4.png", "/Asset 3 (3) 2.png", "/image 226.png"],
    usage: { small: ["/Rectangle 1702.png", "/Rectangle 1700.png"], wide: "/Rectangle 1701.png" },
    benefitSlides: ["/Rectangle 1702-5.png", "/image 226.png", "/Rectangle 1699.png"],
    ringImage: "/Asset 3 (3) 4.png",
    statImage: "/Rectangle 1699.png",
    featured: true,
    rating: 5,
    reviewCount: 128,
    statValues: [95, 90, 85, 80, 90, 98],
  },
  {
    slug: "king-bee",
    name: "KING BEE",
    price: 250000,
    badge: "hit",
    form: "honey",
    // Единственный снимок King Bee в приемлемом разрешении — Asset 1 1-7.png
    // (327×493). Asset 1 1.png / Asset 1 1-1.png — иконка 112×169, в деталке
    // выглядит мылом. Слоты ниже намеренно ссылаются на один файл: галерея и
    // benefitSlides используют путь как React key, поэтому дубликаты в массивах
    // недопустимы — отсюда пустой gallery и один слайд. Раньше здесь стояли
    // Rectangle 1699-6/1700-6/1702-6, то есть фото Cardio Control на странице
    // King Bee. Развернуть обратно в полноценную галерею можно, как только
    // появится съёмка King Bee с нескольких ракурсов.
    image: "/Asset 1 1-7.png",
    hero: "/Asset 1 1-7.png",
    gallery: [],
    usage: { small: ["/Asset 1 1-7.png", "/Asset 1 1-7.png"], wide: "/Asset 1 1-7.png" },
    benefitSlides: ["/Asset 1 1-7.png"],
    ringImage: "/Asset 1 1-7.png",
    statImage: "/Asset 1 1-7.png",
    featured: true,
    rating: 5,
    reviewCount: 214,
    statValues: [98, 95, 92, 90, 88, 100],
  },
  {
    slug: "vitamin-d3",
    name: "Vitamin D3",
    price: 250000,
    badge: "new",
    form: "capsules",
    // Three packshots and no shoot of its own. The slots below used to hold
    // Rectangle 1699-7/1700-7/1702-7 — the old Insulin Balance 330 ml frame and
    // two Cardio Control lifestyle frames.
    image: "/vitamin d3 (2) (3) 1.png",
    hero: "/vitamin d3 (2) (3) 1-1.png",
    gallery: ["/vitamin d3 (2) (3) 1.png", "/vitamin d3 (2) (3) 1-2.png"],
    usage: {
      small: ["/vitamin d3 (2) (3) 1-1.png", "/vitamin d3 (2) (3) 1-2.png"],
      wide: "/vitamin d3 (2) (3) 1.png",
    },
    benefitSlides: [
      "/vitamin d3 (2) (3) 1-1.png",
      "/vitamin d3 (2) (3) 1.png",
      "/vitamin d3 (2) (3) 1-2.png",
    ],
    ringImage: "/vitamin d3 (2) (3) 1.png",
    statImage: "/vitamin d3 (2) (3) 1-2.png",
    featured: true,
    rating: 5,
    reviewCount: 96,
    statValues: [98, 95, 92, 90, 88, 100],
  },
  {
    slug: "black-honey",
    name: "Black Honey",
    price: 450000,
    badge: "rec",
    form: "honey",
    // `black-honey.png` is the packshot off the backend at full resolution; the
    // `asal (2) 1*` frames are the small Figma exports of the same jar.
    // Everything else on this product used to be Cardio Control's shoot
    // (Rectangle 1700-5/1701/1702-5), one frame was Collagen PRO+
    // (`asal (2) 1-2`) and one the old Insulin Balance (Rectangle 1699-5).
    image: "/black-honey.png",
    hero: "/black-honey.png",
    gallery: ["/asal (2) 1.png", "/asal (2) 1-1.png", "/asal (2) 1-5.png"],
    usage: { small: ["/black-honey.png", "/asal (2) 1-1.png"], wide: "/black-honey.png" },
    benefitSlides: ["/black-honey.png", "/asal (2) 1-1.png", "/asal (2) 1-5.png"],
    ringImage: "/black-honey.png",
    statImage: "/black-honey.png",
    featured: true,
    rating: 5,
    reviewCount: 173,
    statValues: [98, 95, 92, 90, 88, 100],
  },
  {
    slug: "detox-hepar-energy",
    name: "Detox Hepar Energy",
    price: 450000,
    badge: "hit",
    form: "syrup",
    image: "/Asset 1 12.png",
    hero: "/Rectangle 1699-4.png",
    gallery: ["/Asset 1 1-2.png", "/image 10.png", "/image 226-1.png"],
    // The wide slot held Rectangle 1701-2, which is the Hemoglobin+ bottle.
    usage: { small: ["/Rectangle 1702-4.png", "/Rectangle 1700-4.png"], wide: "/image 273.png" },
    benefitSlides: ["/image 226-1.png", "/Rectangle 1702-4.png", "/image 49.png"],
    ringImage: "/Asset 1 1-2.png",
    statImage: "/Rectangle 1699-4.png",
    featured: true,
    rating: 5,
    reviewCount: 187,
    statValues: [98, 95, 92, 90, 88, 100],
  },
  {
    slug: "insulin-balance",
    name: "Insulin Balance",
    price: 450000,
    badge: "rec",
    form: "syrup",
    // Rectangle 1699-3 is the discontinued 330 ml bottle and Rectangle 1701-1
    // is Endo Marine+; both are out. What is left is the current 500 ml design.
    image: "/Asset 1 (5) 1.png",
    hero: "/Rectangle 1700-3.png",
    gallery: ["/Asset 1 1-3.png", "/Asset 1 9.png", "/Rectangle 1702-3.png"],
    usage: { small: ["/Rectangle 1700-3.png", "/Asset 1 (5) 1.png"], wide: "/Rectangle 1702-3.png" },
    benefitSlides: ["/Rectangle 1702-3.png", "/Rectangle 1700-3.png", "/Asset 1 9.png"],
    ringImage: "/Asset 1 1-3.png",
    statImage: "/Rectangle 1700-3.png",
    featured: false,
    rating: 5,
    reviewCount: 142,
    statValues: [98, 95, 92, 90, 88, 100],
  },
  {
    slug: "endo-marine",
    name: "Endo Marine+",
    price: 450000,
    badge: "rec",
    form: "syrup",
    image: "/Asset 1 2.png",
    hero: "/Rectangle 1699-1.png",
    // The gallery repeated the hero, and the gallery keys off the path — React
    // was rendering two thumbnails under the same key.
    gallery: ["/Asset 1 1-5.png", "/Asset 1 2.png", "/Rectangle 1700-1.png"],
    usage: { small: ["/Rectangle 1702-1.png", "/Rectangle 1700-1.png"], wide: "/Rectangle 1701-1.png" },
    benefitSlides: ["/Rectangle 1700-1.png", "/Rectangle 1699-1.png", "/Rectangle 1701-1.png"],
    ringImage: "/Asset 1 1-5.png",
    statImage: "/Rectangle 1699-1.png",
    featured: true,
    rating: 5,
    reviewCount: 118,
    statValues: [98, 95, 92, 90, 90, 100],
  },
  {
    /*
     * Added in the CMS after this catalogue was written, so the storefront
     * shipped no entry for it and the detail page fell back to a blank
     * skeleton — which is why its "Характеристики" table rendered empty.
     * The copy lives in `messages/*.json` under `Product.igneus`; this entry
     * carries the structural half: price, form, stat weights and imagery.
     *
     * One packshot exists and no shoot, so — as with King Bee — the gallery
     * stays empty and the composition slots reuse that single file rather than
     * borrowing another product's photos.
     */
    slug: "igneus",
    name: "Igneus",
    price: 550000,
    badge: "rec",
    form: "capsules",
    image: "/igneus.png",
    hero: "/igneus.png",
    gallery: [],
    usage: { small: ["/igneus.png", "/igneus.png"], wide: "/igneus.png" },
    benefitSlides: ["/igneus.png"],
    ringImage: "/igneus.png",
    statImage: "/igneus.png",
    featured: true,
    rating: 5,
    reviewCount: 0,
    statValues: [98, 95, 92, 90, 88, 100],
  },
  {
    slug: "hemoglobin",
    name: "Hemoglobin+",
    price: 450000,
    badge: "hit",
    form: "syrup",
    // Hemoglobin+ was redesigned from a blue 330 ml bottle to the purple 500 ml
    // one. Rectangle 1699-2 and Rectangle 118-7 are the old bottle, Rectangle
    // 118-8 is a shelf of awards with no product in it and Rectangle 1701 is
    // Cardio Control. The frames below are all the current design.
    image: "/Asset 1 6.png",
    hero: "/Rectangle 1700-2.png",
    gallery: ["/Asset 1 1-6.png", "/Rectangle 1702-2.png", "/Rectangle 1701-2.png"],
    usage: { small: ["/Rectangle 1702-2.png", "/Rectangle 1700-2.png"], wide: "/Rectangle 1701-2.png" },
    benefitSlides: ["/Rectangle 1702-2.png", "/Rectangle 1701-2.png", "/Rectangle 1700-2.png"],
    ringImage: "/Asset 1 1-6.png",
    statImage: "/Rectangle 1700-2.png",
    featured: false,
    rating: 5,
    reviewCount: 165,
    statValues: [98, 95, 92, 90, 90, 100],
  },
  {
    slug: "collagen-pro",
    name: "Collagen PRO+",
    price: 250000,
    badge: "rec",
    form: "tablets",
    // `asal (2) 1-6` is the Omega 3-6-9 jar, Rectangle 1699-7 the old Insulin
    // Balance and Rectangle 1700-7/1701/1702-7 the Cardio Control shoot — the
    // whole page was other people's photos. Collagen PRO+ has no shoot of its
    // own, so it shows its own jar everywhere instead.
    image: "/collagen-pro.png",
    hero: "/collagen-pro.png",
    gallery: ["/asal (2) 1-2.png", "/asal (2) 1-3.png"],
    usage: { small: ["/collagen-pro.png", "/asal (2) 1-3.png"], wide: "/collagen-pro.png" },
    benefitSlides: ["/collagen-pro.png", "/asal (2) 1-2.png", "/asal (2) 1-3.png"],
    ringImage: "/collagen-pro.png",
    statImage: "/collagen-pro.png",
    featured: false,
    rating: 5,
    reviewCount: 87,
    statValues: [98, 95, 92, 90, 88, 100],
  },
  {
    slug: "omega-3-6-9",
    name: "Omega 3-6-9",
    price: 250000,
    badge: "rec",
    form: "capsules",
    // Same story as Collagen PRO+: the composition slots held Cardio Control's
    // shoot and the old Insulin Balance frame. Omega has only its own jar.
    image: "/omega-3-6-9.png",
    hero: "/omega-3-6-9.png",
    gallery: ["/asal (2) 1-4.png", "/asal (2) 1-6.png"],
    usage: { small: ["/omega-3-6-9.png", "/asal (2) 1-6.png"], wide: "/omega-3-6-9.png" },
    benefitSlides: ["/omega-3-6-9.png", "/asal (2) 1-4.png", "/asal (2) 1-6.png"],
    ringImage: "/omega-3-6-9.png",
    statImage: "/omega-3-6-9.png",
    featured: false,
    rating: 5,
    reviewCount: 104,
    statValues: [98, 95, 92, 90, 88, 100],
  },
];

export const productSlugs = products.map((product) => product.slug);

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const current = getProduct(slug);
  if (!current) return products.slice(0, limit);

  return [
    ...products.filter((p) => p.slug !== slug && p.form === current.form),
    ...products.filter((p) => p.slug !== slug && p.form !== current.form),
  ].slice(0, limit);
}
