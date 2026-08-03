import createMiddleware from "next-intl/middleware";

import { routing } from "@/lib/i18n/routing";

// Next.js 16 renamed the `middleware` convention to `proxy`.
export const proxy = createMiddleware(routing);

export default proxy;

export const config = {
  // Skip Next internals, API routes and anything that looks like a static file.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
