import { STORE } from "./config";

/** Single source of truth for cache keys, so invalidation can never drift. */
export const queryKeys = {
  all: [STORE] as const,
  products: () => [...queryKeys.all, "products"] as const,
  product: (slug: string) => [...queryKeys.all, "product", slug] as const,
  featured: () => [...queryKeys.all, "featured"] as const,
  blog: () => [...queryKeys.all, "blog"] as const,
  blogPost: (slug: string) => [...queryKeys.all, "blog", slug] as const,
  cart: () => [...queryKeys.all, "cart"] as const,
} as const;
