"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { getProduct as getStaticProduct } from "@/lib/data/products";

/**
 * A packshot that survives its source going bad.
 *
 * Several catalogue records point at the original artwork rather than a web
 * copy — King Bee is a 1 MB PNG, Vitamin D3 a 10 MB one — and the image
 * optimizer abandons the upstream fetch after seven seconds and answers 500.
 * The card then rendered a broken-image box, which is what a shopper saw for a
 * third of the shelf.
 *
 * Nothing on this side can make that origin faster, so instead the failure is
 * caught: on error the image falls back to the bundled copy of the same
 * packshot, which is served off this deployment and cannot time out. Products
 * with no bundled copy fall back to nothing and keep the empty box — there is
 * no honest picture to show for those.
 *
 * The real fix is upstream: re-upload those photos at web weight in the admin.
 * Until that happens the storefront should not be showing a broken frame.
 */
export function ProductImage({
  slug,
  src,
  ...props
}: Omit<ImageProps, "src" | "onError"> & { slug: string; src: string }) {
  const [current, setCurrent] = useState(src);
  const fallback = getStaticProduct(slug)?.image;

  return (
    <Image
      {...props}
      src={current}
      onError={() => {
        if (fallback && current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
