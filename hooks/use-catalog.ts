"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getBlogFeed,
  getFeatured,
  getProductBySlug,
  getProductList,
} from "@/lib/api/endpoints";
import { isApiConfigured } from "@/lib/api/config";
import { queryKeys } from "@/lib/api/query-keys";
import type { ApiBlogPost, ApiProduct } from "@/lib/api/types";

/**
 * Client-side catalogue reads.
 *
 * Pages fetch the catalogue on the server, so these exist for anything that
 * needs it after hydration — live stock on a product page, a client-side
 * filter, a cart re-check. Each hook is disabled when no backend is
 * configured, so it resolves to `undefined` and the caller keeps its static
 * data instead of spinning forever.
 */

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products(),
    queryFn: async (): Promise<ApiProduct[]> => (await getProductList()).products ?? [],
    enabled: isApiConfigured(),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: isApiConfigured() && Boolean(slug),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.featured(),
    queryFn: async (): Promise<ApiProduct[]> => {
      const data = await getFeatured();
      return Array.isArray(data) ? data : (data.rows ?? []);
    },
    enabled: isApiConfigured(),
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: queryKeys.blog(),
    queryFn: async (): Promise<ApiBlogPost[]> => {
      const data = await getBlogFeed();
      return Array.isArray(data) ? data : (data.posts ?? []);
    },
    enabled: isApiConfigured(),
  });
}
