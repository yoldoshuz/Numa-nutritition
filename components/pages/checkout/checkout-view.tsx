"use client";

import Image from "next/image";
import { CircleCheck, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Container } from "@/components/shared/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useCart, useCheckout } from "@/hooks";
import { enabledPaymentMethods, normalizePhone } from "@/lib/api/checkout";
import { formatUzPhoneInput, UZ_PHONE_PREFIX } from "@/lib/phone";
import type { OfferedPaymentMethod } from "@/lib/api/types";
import { formatAmount } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types";

const fields = ["name", "surname", "phone", "city", "address"] as const;

const autoComplete: Record<(typeof fields)[number], string> = {
  name: "given-name",
  surname: "family-name",
  phone: "tel",
  city: "address-level2",
  address: "street-address",
};

export function CheckoutView() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Checkout");
  const tCommon = useTranslations("Common");
  const tCart = useTranslations("Cart");
  const tProduct = useTranslations("Product");

  const { items, count, subtotal, totals, ready } = useCart();
  const { user } = useAuth();
  const { phase, errorKey, orderId, busy, setErrorKey, submit } = useCheckout();

  // First offered wins, so the preselected method follows the list rather than
  // a second constant that could drift from it.
  const methods = enabledPaymentMethods();

  /**
   * What the account already knows, so a signed-in customer is not asked to
   * type it again. Empty for a guest, who fills the form as before.
   */
  const prefill: Partial<Record<(typeof fields)[number], string>> = user
    ? {
        name: user.firstName,
        surname: user.lastName ?? "",
        phone: formatUzPhoneInput(user.phone),
      }
    : {};
  const [method, setMethod] = useState<OfferedPaymentMethod>(methods[0] ?? "click");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = new FormData(event.currentTarget);
    const phone = normalizePhone(String(form.get("phone") ?? ""));
    if (!phone) {
      setErrorKey("phonePlaceholder");
      return;
    }

    setErrorKey(null);
    submit({
      method,
      payload: {
        customerName: String(form.get("name") ?? "").trim(),
        customerSurname: String(form.get("surname") ?? "").trim(),
        customerPhone: phone,
        // The API takes a single address line; the city input is folded in.
        customerAddress: [form.get("city"), form.get("address")]
          .map((part) => String(part ?? "").trim())
          .filter(Boolean)
          .join(", "),
        deliveryType: "delivery",
      },
    });
  }

  if (orderId && !errorKey) {
    return (
      <section className="py-16 lg:py-24">
        <Container className="flex max-w-lg flex-col items-center gap-4 text-center">
          <CircleCheck className="size-16 text-brand" strokeWidth={1.5} />
          <h1 className="font-heading text-2xl font-extrabold text-ink sm:text-3xl">
            {t("successTitle")}
          </h1>
          <p className="text-sm leading-relaxed text-muted-ink">{t("successText")}</p>
          <p className="text-xs text-muted-ink">
            {t("orderNumber")}:{" "}
            <span className="font-mono font-semibold text-ink">
              {orderId.slice(0, 8).toUpperCase()}
            </span>
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            {tCommon("backHome")}
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <section className="pt-8 pb-14 lg:pt-10 lg:pb-20">
      <Container>
        <h1 className="font-heading text-[2rem] font-extrabold text-ink sm:text-[2.75rem]">
          {t("title")}
        </h1>

        {ready && items.length === 0 && !orderId ? (
          <div className="mt-8 rounded-2xl border border-line bg-white p-10 text-center shadow-card">
            <p className="font-heading text-lg font-bold text-ink">{t("emptyRedirect")}</p>
            <Link
              href="/products"
              className="mt-5 inline-flex h-12 items-center justify-center rounded-lg bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-600"
            >
              {tCommon("goToCatalog")}
            </Link>
          </div>
        ) : (
          <form key={user?.id ?? "guest"} onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col gap-6">
              <fieldset
                disabled={busy}
                className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7"
              >
                <legend className="px-1 font-heading text-lg font-extrabold text-ink sm:text-xl">
                  {t("contactTitle")}
                </legend>

                <div className="mt-4 flex flex-col gap-4">
                  {fields.map((field) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <Label htmlFor={field} className="text-[0.8125rem] font-bold text-ink">
                        {t(field)}
                        <span className="text-brand">*</span>
                      </Label>
                      <Input
                        id={field}
                        name={field}
                        defaultValue={

                          prefill[field] ?? (field === "phone" ? UZ_PHONE_PREFIX : undefined)

                        }
                        required
                        type={field === "phone" ? "tel" : "text"}
                        inputMode={field === "phone" ? "tel" : undefined}
                        autoComplete={autoComplete[field]}
                        placeholder={t(`${field}Placeholder`)}
                        {...(field === "phone"
                          ? {
                              // The field carries the country code and regroups
                              // digits as they are typed, so what the customer
                              // sees is what the API will accept.
                              onInput: (event: FormEvent<HTMLInputElement>) => {
                                event.currentTarget.value = formatUzPhoneInput(
                                  event.currentTarget.value,
                                );
                              },
                            }
                          : {})}
                        className="h-12 rounded-lg border-line px-4 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
                <h2 className="font-heading text-lg font-extrabold text-ink sm:text-xl">
                  {t("deliveryTitle")}
                </h2>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50/60 px-4 py-3">
                  <span className="leading-tight">
                    <span className="block text-[0.875rem] font-semibold text-ink">
                      {t("deliveryOption")}
                    </span>
                    <span className="block text-[0.75rem] text-muted-ink">
                      {t("deliveryTime")}
                    </span>
                  </span>
                  <span className="text-[0.8125rem] font-bold text-brand">
                    {tCommon("free")}
                  </span>
                </div>
              </div>

              <fieldset
                disabled={busy}
                className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7"
              >
                <legend className="px-1 font-heading text-lg font-extrabold text-ink sm:text-xl">
                  {t("paymentTitle")}
                </legend>

                <div className="mt-4 flex flex-col gap-3">
                  {methods.map((option) => {
                    const active = method === option;
                    const key = option.charAt(0).toUpperCase() + option.slice(1);
                    return (
                      <label
                        key={option}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
                          active
                            ? "border-brand bg-brand-50/60"
                            : "border-line hover:border-brand-200",
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option}
                          checked={active}
                          onChange={() => setMethod(option)}
                          className="mt-0.5 size-4 accent-brand"
                        />
                        <span className="leading-tight">
                          <span className="block text-[0.875rem] font-semibold text-ink">
                            {t(`payment${key}`)}
                          </span>
                          <span className="block text-[0.75rem] text-muted-ink">
                            {t(`payment${key}Hint`)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
              <h2 className="font-heading text-lg font-extrabold text-ink sm:text-xl">
                {t("orderTitle")}
              </h2>

              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.slug} className="flex items-center gap-4">
                    {/*
                      The packshot is centred out of flow, so its box is 86% of
                      the tile in both directions no matter what the file is.
                      Sized in flow it took its height from `h-full`, which only
                      resolves while the tile's own height stays definite — the
                      same footing that let an upright bottle stretch the ring on
                      the product page.
                    */}
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-brand-200 bg-surface-mint">
                      <Image
                        src={item.product.image}
                        alt=""
                        width={64}
                        height={64}
                        sizes="64px"
                        className="absolute top-1/2 left-1/2 size-[86%] -translate-x-1/2 -translate-y-1/2 object-contain"
                      />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[0.875rem] font-bold text-ink">
                        {tProduct(`${item.slug}.name`)}
                      </span>
                      <span className="block text-[0.75rem] text-muted-ink">
                        {item.quantity} {tCommon("pcs")}
                      </span>
                    </span>
                    <span className="text-[0.875rem] font-semibold text-ink">
                      {formatAmount(item.product.price * item.quantity)}{" "}
                      {tCommon("currency")}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="flex flex-col gap-3 border-t border-line pt-4 text-[0.9375rem]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-ink">{tCart("items", { count })}</dt>
                  <dd className="font-bold text-ink">
                    {formatAmount(subtotal)} {tCommon("currency")}
                  </dd>
                </div>
                {/* Priced by the API so the basket and the created order
                    cannot disagree; free from two units up. */}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-ink">{tCart("delivery")}</dt>
                  <dd className="font-bold text-ink">
                    {totals.deliveryFee > 0
                      ? `${formatAmount(totals.deliveryFee)} ${tCommon("currency")}`
                      : tCommon("free")}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <dt className="font-bold text-ink">{tCart("total")}</dt>
                  <dd className="font-heading text-lg font-extrabold text-ink">
                    {formatAmount(totals.grandTotal)} {tCommon("currency")}
                  </dd>
                </div>
              </dl>

              {errorKey ? (
                <p role="alert" className="text-[0.8125rem] font-medium text-red-600">
                  {t(errorKey)}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {phase === "submitting"
                  ? t("submitting")
                  : phase === "redirecting"
                    ? t("redirecting")
                    : method === "cash"
                      ? t("payCash")
                      : t("pay")}
              </button>
            </aside>
          </form>
        )}
      </Container>
    </section>
  );
}
