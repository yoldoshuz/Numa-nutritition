"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError } from "@/lib/api/axios";
import { CATALOG_REVALIDATE_SECONDS } from "@/lib/api/config";

/**
 * One client per browser session, created inside state so a Server Component
 * re-render never hands two requests the same cache.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CATALOG_REVALIDATE_SECONDS * 1000,
        refetchOnWindowFocus: false,
        // A missing backend is a permanent condition for this page load, and
        // every consumer already has a static fallback — retrying just delays
        // it. Genuine network blips still get one more chance.
        retry: (failureCount, error) =>
          error instanceof ApiError && error.status === 0 ? false : failureCount < 1,
      },
      mutations: { retry: false },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
