import {
  EMPTY_PRODUCT_IMAGES,
  GALLERY_SLOTS,
  type ProductImages,
} from "@/lib/product-images";
import type { Product } from "@/types";

/**
 * The bundled catalogue's own photographs, placed into the gallery slots.
 *
 * The offline storefront has no admin behind it, so this is where its artwork
 * declares which places it fills: the product page reads named slots and
 * nothing else. Only the gallery is bundled — the informational slots are
 * content, and content nobody has uploaded has no stand-in. That is what this
 * file used to be doing wrong: `usage`, `benefitSlides`, `ringImage` and
 * `statImage` handed every block a file whether or not the product had one, so
 * King Bee's single photograph was printed into five frames and the page read
 * as a product with no photographs at all.
 *
 * The dimensions are the slot's specification, which is all a layout needs from
 * them.
 */
function bundledGallery(...urls: string[]): ProductImages {
  return {
    ...EMPTY_PRODUCT_IMAGES,
    ...Object.fromEntries(
      urls
        .slice(0, GALLERY_SLOTS.length)
        .map((url, index) => [GALLERY_SLOTS[index], { url, width: 1000, height: 1000 }]),
    ),
  };
}

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
 * A product with no shoot of its own declares only the gallery places it can
 * actually fill. It used to repeat its packshot across every composition slot
 * so that no block rendered empty; the blocks now render empty on purpose,
 * because a page that shows one bottle five times reads as a page with no
 * photographs.
 */
export const products: Product[] = [
  {
    slug: "cardio-control",
    name: "Cardio Control",
    price: 400000,
    badge: "hit",
    form: "syrup",
    image: "/Asset 3 (3) 1.png",
    images: bundledGallery(
      "/Rectangle 1699.png",
      "/Asset 1 1-4.png",
      "/Asset 3 (3) 2.png",
      "/image 226.png",
    ),
    featured: true,
    rating: 5,
    reviewCount: 128,
    statValues: [95, 90, 85, 80, 90, 98],
    order: 1,
  },
  {
    slug: "king-bee",
    name: "KING BEE",
    price: 250000,
    badge: "hit",
    form: "honey",
    // Единственный снимок King Bee в приемлемом разрешении — Asset 1 1-7.png
    // (327×493). Asset 1 1.png / Asset 1 1-1.png — иконка 112×169, в деталке
    // выглядит мылом. Поэтому здесь один слот: gallery_1. Остальные пусты, и
    // страница честно рендерится без фотографий там, где их нет — раньше этот
    // файл дублировался в пять рамок, а до него там стояли Rectangle
    // 1699-6/1700-6/1702-6, то есть фото Cardio Control на странице King Bee.
    // Развернуть галерею можно, как только появится съёмка с нескольких
    // ракурсов — загрузив её в слоты через админку, а не сюда.
    image: "/Asset 1 1-7.png",
    images: bundledGallery("/Asset 1 1-7.png"),
    featured: true,
    rating: 5,
    reviewCount: 214,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 2,
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
    images: bundledGallery(
      "/vitamin d3 (2) (3) 1-1.png",
      "/vitamin d3 (2) (3) 1.png",
      "/vitamin d3 (2) (3) 1-2.png",
    ),
    featured: true,
    rating: 5,
    reviewCount: 96,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 3,
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
    images: bundledGallery(
      "/black-honey.png",
      "/asal (2) 1.png",
      "/asal (2) 1-1.png",
      "/asal (2) 1-5.png",
    ),
    featured: true,
    rating: 5,
    reviewCount: 173,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 4,
  },
  {
    slug: "detox-hepar-energy",
    name: "Detox Hepar Energy",
    price: 450000,
    badge: "hit",
    form: "syrup",
    image: "/Asset 1 12.png",
    images: bundledGallery(
      "/Rectangle 1699-4.png",
      "/Asset 1 1-2.png",
      "/image 10.png",
      "/image 226-1.png",
    ),
    // The wide slot held Rectangle 1701-2, which is the Hemoglobin+ bottle.
    featured: true,
    rating: 5,
    reviewCount: 187,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 5,
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
    images: bundledGallery(
      "/Rectangle 1700-3.png",
      "/Asset 1 1-3.png",
      "/Asset 1 9.png",
      "/Rectangle 1702-3.png",
    ),
    featured: false,
    rating: 5,
    reviewCount: 142,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 6,
  },
  {
    slug: "endo-marine",
    name: "Endo Marine+",
    price: 450000,
    badge: "rec",
    form: "syrup",
    image: "/Asset 1 2.png",
    images: bundledGallery(
      "/Rectangle 1699-1.png",
      "/Asset 1 1-5.png",
      "/Asset 1 2.png",
      "/Rectangle 1700-1.png",
    ),
    // The gallery repeated the hero, and the gallery keys off the path — React
    // was rendering two thumbnails under the same key.
    featured: true,
    rating: 5,
    reviewCount: 118,
    statValues: [98, 95, 92, 90, 90, 100],
    order: 7,
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
    images: bundledGallery("/igneus.png"),
    featured: true,
    rating: 5,
    reviewCount: 0,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 8,
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
    images: bundledGallery(
      "/Rectangle 1700-2.png",
      "/Asset 1 1-6.png",
      "/Rectangle 1702-2.png",
      "/Rectangle 1701-2.png",
    ),
    featured: false,
    rating: 5,
    reviewCount: 165,
    statValues: [98, 95, 92, 90, 90, 100],
    order: 9,
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
    images: bundledGallery("/collagen-pro.png", "/asal (2) 1-2.png", "/asal (2) 1-3.png"),
    featured: false,
    rating: 5,
    reviewCount: 87,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 10,
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
    images: bundledGallery("/omega-3-6-9.png", "/asal (2) 1-4.png", "/asal (2) 1-6.png"),
    featured: false,
    rating: 5,
    reviewCount: 104,
    statValues: [98, 95, 92, 90, 88, 100],
    order: 11,
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
