"use client";

import Image from "next/image";
import { Leaf, Headset, Trash2, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/hooks";
import { formatAmount } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import type { AppLocale } from "@/types";

const perkIcons = { delivery: Truck, natural: Leaf, support: Headset } as const;

export function CartView() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Cart");
  const tCommon = useTranslations("Common");
  const tProduct = useTranslations("Product");
  const { items, count, subtotal, totals, lineInfo, hasUnavailable, setQuantity, remove, ready } =
    useCart();

  return (
    <section className="pt-8 pb-14 lg:pt-10 lg:pb-20">
      <Container>
        <h1 className="font-heading text-[2rem] font-extrabold text-ink sm:text-[2.75rem]">
          {t("title")}
        </h1>

        {ready && items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-white p-10 text-center shadow-card">
            <p className="font-heading text-xl font-bold text-ink">{t("empty")}</p>
            <p className="mt-2 text-sm text-muted-ink">{t("emptyDescription")}</p>
            <Link
              href="/products"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-600"
            >
              {tCommon("goToCatalog")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <ul className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
              {items.map((item) => {
                const info = lineInfo.get(item.slug);
                const unavailable = info?.isAvailable === false;
                return (
                <li
                  key={item.slug}
                  className={`flex flex-col gap-4 border-b border-line pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center${
                    unavailable ? " opacity-60" : ""
                  }`}
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-brand-200 bg-surface-mint sm:size-28"
                  >
                    <Image
                      src={item.product.image}
                      alt=""
                      width={112}
                      height={112}
                      sizes="112px"
                      className="h-full w-full object-contain p-2.5"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-heading text-[0.9375rem] font-bold text-ink transition-colors hover:text-brand"
                    >
                      {tProduct(`${item.slug}.name`)}
                    </Link>
                    <p className="mt-0.5 text-[0.75rem] text-muted-ink">
                      {tProduct(`${item.slug}.specs.0.value`)}
                    </p>
                    <p className="mt-2 font-heading text-[0.9375rem] font-bold text-ink">
                      {formatAmount(info?.unitPrice ?? item.product.price, locale)}{" "}
                      {tCommon("currency")}
                    </p>
                    {unavailable ? (
                      <p className="mt-1 text-[0.75rem] font-bold text-red-600">
                        {t("unavailable")}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(value) => setQuantity(item.slug, value)}
                      label={tProduct("quantity")}
                      decreaseLabel={tProduct("decrease")}
                      increaseLabel={tProduct("increase")}
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={() => remove(item.slug)}
                      aria-label={t("remove")}
                      className="grid size-10 place-items-center rounded-full border border-line text-muted-ink transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
                );
              })}
            </ul>

            <aside className="flex h-fit flex-col gap-5 rounded-2xl bg-brand p-6 text-white shadow-card sm:p-7">
              <h2 className="font-heading text-xl font-extrabold">{t("summaryTitle")}</h2>

              <dl className="flex flex-col gap-3 text-[0.9375rem]">
                <div className="flex items-center justify-between">
                  <dt className="text-white/90">{t("items", { count })}</dt>
                  <dd className="font-bold">
                    {formatAmount(subtotal, locale)} {tCommon("currency")}
                  </dd>
                </div>
                {/* Priced by the API so the basket and the created order
                    cannot disagree; free from two units up. */}
                <div className="flex items-center justify-between">
                  <dt className="text-white/90">{t("delivery")}</dt>
                  <dd className="font-bold">
                    {totals.deliveryFee > 0
                      ? `${formatAmount(totals.deliveryFee, locale)} ${tCommon("currency")}`
                      : tCommon("free")}
                  </dd>
                </div>
                {totals.unavailableTotal > 0 ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-white/90">{t("unavailableTotal")}</dt>
                    <dd className="font-bold text-white/70 line-through">
                      {formatAmount(totals.unavailableTotal, locale)} {tCommon("currency")}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-white/30 pt-3">
                  <dt className="font-bold">{t("total")}</dt>
                  <dd className="font-heading text-lg font-extrabold">
                    {formatAmount(totals.grandTotal, locale)} {tCommon("currency")}
                  </dd>
                </div>
              </dl>

              {/* Checkout would reject these lines anyway; say so here instead of
                  letting the customer bounce off a 400 on the next screen. */}
              {hasUnavailable ? (
                <div className="rounded-lg bg-white/15 p-3 text-[0.8125rem] leading-snug text-white">
                  {t("unavailableHint")}
                </div>
              ) : null}

              <Link
                href="/checkout"
                aria-disabled={hasUnavailable}
                onClick={(event) => {
                  if (hasUnavailable) event.preventDefault();
                }}
                className={`inline-flex h-12 items-center justify-center rounded-lg bg-white text-sm font-bold text-brand transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white${
                  hasUnavailable
                    ? " pointer-events-none opacity-50"
                    : " hover:bg-brand-50 active:translate-y-px"
                }`}
              >
                {t("checkout")}
              </Link>

              <ul className="flex flex-col gap-4 rounded-xl bg-brand-800/60 p-4">
                {(["delivery", "natural", "support"] as const).map((perk) => {
                  const Icon = perkIcons[perk];
                  return (
                    <li key={perk} className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-brand">
                        <Icon className="size-[1.15rem]" />
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[0.8125rem] font-bold">
                          {t(`perks.${perk}.title`)}
                        </span>
                        <span className="block text-[0.6875rem] text-white/85">
                          {t(`perks.${perk}.text`)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        )}
      </Container>
    </section>
  );
}
