/**
 * The four sections that are nothing but a photograph.
 *
 * They have no block in the CMS and no copy to speak of — a label shot, a
 * lifestyle frame, a certificate, a wide strip — so each one exists exactly as
 * long as its slot has a file in it and disappears when it does not. Every slot
 * here has been fillable in the admin for a while with nowhere on the page to
 * land.
 */

import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { SlotImage } from "@/components/shared/slot-image";
import { hasSlots } from "@/lib/product-images";
import type { Product } from "@/types";

/** Состав / этикетка — the pack read close up, shot square. */
export function ProductLabel({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const tOwn = useTranslations(`Product.${product.slug}`);
  if (!hasSlots(product.images, "composition_1")) return null;

  return (
    <section className="py-14 lg:py-18">
      <Container className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,400px)] lg:gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {t("slots.compositionTitle")}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-ink">
            {t("slots.compositionText", { name: tOwn("name") })}
          </p>
        </div>
        <SlotImage
          images={product.images}
          slot="composition_1"
          alt={t("slots.compositionTitle")}
          sizes="(max-width: 1024px) 100vw, 400px"
          className="rounded-2xl bg-surface-mint"
          imageClassName="p-4"
        />
      </Container>
    </section>
  );
}

/** The lifestyle frame — the product in a kitchen rather than on a plate. */
export function ProductLifestyle({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const tOwn = useTranslations(`Product.${product.slug}`);
  if (!hasSlots(product.images, "lifestyle_1")) return null;

  return (
    <section className="pb-14 lg:pb-18">
      <Container>
        <SlotImage
          images={product.images}
          slot="lifestyle_1"
          alt={t("slots.lifestyleTitle", { name: tOwn("name") })}
          sizes="(max-width: 1280px) 100vw, 1200px"
          fit="cover"
          className="rounded-2xl bg-surface-mint"
        />
      </Container>
    </section>
  );
}

/** Сертификат — upright, so it is readable rather than decorative. */
export function ProductCertificate({ product }: { product: Product }) {
  const t = useTranslations("Product");
  if (!hasSlots(product.images, "certificate_1")) return null;

  return (
    <section className="pb-14 lg:pb-18">
      <Container className="grid items-center gap-8 sm:grid-cols-[minmax(0,280px)_1fr] sm:gap-12">
        <SlotImage
          images={product.images}
          slot="certificate_1"
          alt={t("slots.certificateTitle")}
          sizes="(max-width: 640px) 80vw, 280px"
          className="mx-auto w-full max-w-[280px] rounded-2xl border border-line bg-white"
          imageClassName="p-3"
        />
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {t("slots.certificateTitle")}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-ink">
            {t("slots.certificateText")}
          </p>
        </div>
      </Container>
    </section>
  );
}

/**
 * The wide strip. This is the slot for a 3:1 band — the one place on the page
 * where a letterbox is the photograph's own shape rather than a crop of it.
 */
export function ProductBanner({ product }: { product: Product }) {
  const tOwn = useTranslations(`Product.${product.slug}`);
  if (!hasSlots(product.images, "banner_wide")) return null;

  return (
    <section className="pb-14 lg:pb-18">
      <Container>
        <SlotImage
          images={product.images}
          slot="banner_wide"
          alt={tOwn("name")}
          sizes="(max-width: 1280px) 100vw, 1200px"
          fit="cover"
          className="rounded-2xl bg-surface-mint"
        />
      </Container>
    </section>
  );
}
