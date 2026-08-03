import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { AddToCartButton } from "@/components/shared/add-to-cart-button";
import { Price } from "@/components/shared/price";
import { ProductBadge } from "@/components/shared/product-badge";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const t = useTranslations("Common");
  const tProduct = useTranslations(`Product.${product.slug}`);
  const tShared = useTranslations("Product");
  const href = `/products/${product.slug}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-5",
        className
      )}
    >
      <ProductBadge kind={product.badge} className="absolute top-4 left-4 z-10" />

      {/* Fixed-ratio box so every packshot occupies exactly the same space. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative mt-7 block h-44 w-full overflow-hidden sm:h-52"
      >
        <Image
          src={product.image}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="mt-4 flex flex-1 flex-col items-center gap-2 text-center">
        <h3 className="font-heading text-[0.95rem] font-bold text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {tProduct("name")}
          </Link>
        </h3>
        <p className="line-clamp-2 min-h-9 text-[0.8125rem] leading-snug text-muted-ink">
          {tProduct("short")}
        </p>
        <Price value={product.price} className="mt-auto pt-2 text-base sm:text-[1.0625rem]" />
      </div>

      <div className="relative z-10 mt-4 flex items-center gap-2">
        <AddToCartButton
          slug={product.slug}
          label={t("buy")}
          addedLabel={tShared("added")}
          className="h-10 flex-1 px-3 text-[0.8125rem]"
        />
        <Link
          href={href}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-300 px-3 text-[0.8125rem] font-medium text-brand-700 transition-colors duration-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {t("details")}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
