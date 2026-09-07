"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Loader2,
  LogOut,
  Package,
  Pencil,
  ReceiptText,
  Trash2,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/shared/container";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useAuth, useCart } from "@/hooks";
import {
  getMyOrder,
  getMyOrders,
  getProfile,
  getPurchases,
  updateProfile,
  type Purchase,
} from "@/lib/api/account";
import { formatAmount } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types";

/**
 * Panels, not boxes. Four identically bordered white cards stacked down the page
 * read as a wireframe; these sit on the page as soft surfaces and let the
 * section headings and the money carry the hierarchy instead.
 */
const PANEL = "rounded-2xl bg-white p-5 shadow-card ring-1 ring-line/70 sm:p-7";

const STATUS_TONE: Record<string, string> = {
  new: "bg-brand-50 text-brand-700",
  processing: "bg-amber-50 text-amber-700",
  completed: "bg-brand text-white",
  cancelled: "bg-rose-50 text-rose-600",
};

export function AccountView() {
  const t = useTranslations("Account");
  const { status } = useAuth();
  const router = useRouter();

  // The provider spends a stored token on `/auth/me` before anyone counts as
  // signed in, so this only fires once that has actually settled.
  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-brand" />
        <span className="sr-only">{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-soft/60 pb-14 sm:pb-20">
      <ProfileHeader />
      <Container className="mt-6 flex flex-col gap-5 sm:mt-8 sm:gap-6">
        <CartPanel />
        <OrdersPanel />
        <PurchasesPanel />
      </Container>
    </div>
  );
}

/* ── header ──────────────────────────────────────────────────────────────── */

/**
 * The account opens with the person, not with a form: initials, name, number.
 * Editing is a quiet affordance inside it rather than a fifth stacked card.
 */
function ProfileHeader() {
  const t = useTranslations("Account");
  const { user, setUser, signOut } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["account", "profile"],
    queryFn: getProfile,
    initialData: user ?? undefined,
  });

  const save = useMutation({
    mutationFn: () =>
      updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() }),
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.setQueryData(["account", "profile"], updated);
      setEditing(false);
    },
  });

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const field =
    "h-11 w-full rounded-lg bg-white px-3 text-sm text-ink ring-1 ring-line outline-none transition-shadow focus:ring-2 focus:ring-brand";

  return (
    <section className="bg-gradient-to-b from-brand-50 to-surface-soft/0 pt-8 pb-2 sm:pt-12">
      <Container>
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <span
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-full bg-brand font-heading text-xl font-extrabold text-white shadow-card sm:size-20 sm:text-2xl"
          >
            {initials || "?"}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl leading-tight font-extrabold break-words text-ink sm:text-3xl">
              {fullName || t("title")}
            </h1>
            {/* The number is the account's identity and cannot be edited. */}
            <p className="mt-1 font-mono text-sm text-muted-ink">{profile?.phone}</p>
          </div>

          {/*
            `w-full` drops the actions onto their own line on a phone, where
            keeping them beside the name squeezed it to an ellipsis and ran the
            number underneath the buttons.
          */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setFirstName(profile?.firstName ?? "");
                  setLastName(profile?.lastName ?? "");
                  setEditing(true);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-line transition-colors hover:text-brand-700"
              >
                <Pencil className="size-3.5" />
                {t("edit")}
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-muted-ink transition-colors hover:text-ink"
            >
              <LogOut className="size-4" />
              {t("signOut")}
            </button>
          </div>
        </div>

        {editing && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
            className="mt-5 grid gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-line/70 sm:grid-cols-[1fr_1fr_auto] sm:p-5"
          >
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder={t("firstName")}
              className={field}
            />
            <input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder={t("lastName")}
              className={field}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={save.isPending || firstName.trim().length < 2}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60 sm:flex-none"
              >
                {save.isPending && <Loader2 className="size-4 animate-spin" />}
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-11 rounded-lg px-4 text-sm font-medium text-muted-ink hover:text-ink"
              >
                {t("cancel")}
              </button>
            </div>
            {save.isError && (
              <p role="alert" className="text-sm text-rose-600 sm:col-span-3">
                {t("errors.network")}
              </p>
            )}
          </form>
        )}
      </Container>
    </section>
  );
}

/* ── shared bits ─────────────────────────────────────────────────────────── */

function PanelHead({
  icon,
  title,
  count,
  hint,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold text-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
            {icon}
          </span>
          {title}
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
              {count}
            </span>
          )}
        </h2>
        {hint && <p className="mt-1.5 text-sm text-muted-ink">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/** Centred icon + line, so an empty section still looks designed. */
function EmptyState({
  icon,
  text,
  action,
}: {
  icon: React.ReactNode;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-surface-soft/70 px-4 py-8 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-white text-muted-ink shadow-card">
        {icon}
      </span>
      <p className="text-sm text-muted-ink">{text}</p>
      {action}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const t = useTranslations("Account");
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.6875rem] font-bold",
        STATUS_TONE[status] ?? "bg-surface-soft text-muted-ink",
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}

/** Which shop a row came from — one account covers all of them. */
function StoreTag({ store }: { store?: string }) {
  const t = useTranslations("Account");
  if (!store) return null;
  return (
    <span className="rounded-full bg-surface-soft px-2.5 py-1 text-[0.6875rem] font-medium text-muted-ink">
      {t(`stores.${store}`)}
    </span>
  );
}

/* ── basket ──────────────────────────────────────────────────────────────── */

/**
 * The basket lives here rather than on a page of its own.
 *
 * Once someone is signed in, what they are about to buy, what they have
 * ordered and what they bought before read better as one screen than as three
 * the header has to choose between. `/cart` still works; it just stops being
 * where the header points.
 */
function CartPanel() {
  const t = useTranslations("Account");
  const locale = useLocale() as AppLocale;
  const { items, count, subtotal, ready, hasUnavailable, setQuantity, remove } =
    useCart();

  // The server returns the basket in the order it last wrote it, so without


  // a fixed sort a quantity change reshuffles the rows under the cursor.


  const rows = [...items].sort((a, b) => a.slug.localeCompare(b.slug));


  


  return (
    <section className={PANEL}>
      <PanelHead
        icon={<ShoppingCart className="size-4" />}
        title={t("cart")}
        count={ready ? count : undefined}
        action={
          ready && count > 0 ? (
            <Link
              href="/checkout"
              className="inline-flex h-11 items-center rounded-lg bg-brand px-6 text-sm font-bold text-white transition-colors hover:bg-brand-600"
            >
              {t("checkout")}
            </Link>
          ) : undefined
        }
      />

      {!ready ? (
        <Loader2 className="mt-5 size-5 animate-spin text-brand" />
      ) : count === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-4" />}
          text={t("emptyCart")}
          action={
            <Link
              href="/products"
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              {t("toCatalogue")}
            </Link>
          }
        />
      ) : (
        <>
          <ul className="mt-5 flex flex-col divide-y divide-line/70">
            {rows.map((item) => (
              <li key={item.slug} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-mint">
                  <Image
                    src={item.product.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {item.product.name}
                  </span>
                  <span className="block text-xs text-muted-ink">
                    {formatAmount(item.product.price)}
                  </span>
                </span>
                <span className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(next) => setQuantity(item.slug, next)}
                    size="sm"
                    label={t("quantity")}
                    decreaseLabel={t("decrease")}
                    increaseLabel={t("increase")}
                  />
                  <span className="w-24 text-right text-sm font-bold whitespace-nowrap text-ink">
                    {formatAmount(item.product.price * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    aria-label={t("removeItem")}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-ink transition-colors hover:bg-surface-soft hover:text-rose-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-mint px-4 py-3">
            <span className="text-sm font-medium text-ink">{t("total")}</span>
            <span className="font-heading text-xl font-extrabold text-ink">
              {formatAmount(subtotal)}
            </span>
          </div>

          {hasUnavailable && (
            <p className="mt-3 text-sm text-rose-600">{t("cartUnavailable")}</p>
          )}
        </>
      )}
    </section>
  );
}

/* ── orders ──────────────────────────────────────────────────────────────── */

function OrdersPanel() {
  const t = useTranslations("Account");
  const locale = useLocale() as AppLocale;
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["account", "orders", page],
    queryFn: () => getMyOrders({ page, limit: 10 }),
  });

  return (
    <section className={PANEL}>
      <PanelHead
        icon={<Package className="size-4" />}
        title={t("orders")}
        count={data?.total}
      />

      {isPending ? (
        <Loader2 className="mt-5 size-5 animate-spin text-brand" />
      ) : isError ? (
        <p className="mt-5 text-sm text-rose-600">{t("errors.network")}</p>
      ) : !data?.orders.length ? (
        <EmptyState icon={<Package className="size-4" />} text={t("noOrders")} />
      ) : (
        <>
          <ul className="mt-5 flex flex-col gap-2.5">
            {data.orders.map((order) => {
              const open = openId === order.id;
              return (
                <li
                  key={order.id}
                  className={cn(
                    "rounded-xl ring-1 transition-colors",
                    open ? "bg-surface-soft/60 ring-brand-200" : "ring-line/70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : order.id)}
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-mono text-sm font-semibold text-ink">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-muted-ink">
                        {new Date(order.createdAt).toLocaleDateString(locale)}
                      </span>
                    </span>
                    {/* Wraps on a phone: four items in a fixed row pushed the
                        total off the edge at 375px. */}
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <StoreTag store={order.store} />
                      <StatusPill status={order.status} />
                      <span className="font-heading text-base font-extrabold whitespace-nowrap text-ink">
                        {formatAmount(Number(order.totalAmount))}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-ink transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </span>
                  </button>
                  {open && <OrderLines id={order.id} />}
                </li>
              );
            })}
          </ul>

          {data.pages > 1 && (
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="h-10 rounded-lg px-4 text-sm font-medium ring-1 ring-line disabled:opacity-40"
              >
                {t("prev")}
              </button>
              <span className="text-sm text-muted-ink">
                {data.page} / {data.pages}
              </span>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => setPage((current) => current + 1)}
                className="h-10 rounded-lg px-4 text-sm font-medium ring-1 ring-line disabled:opacity-40"
              >
                {t("next")}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** The full order, fetched only when its row is opened. */
function OrderLines({ id }: { id: string }) {
  const t = useTranslations("Account");
  const locale = useLocale() as AppLocale;
  const { data, isPending, isError } = useQuery({
    queryKey: ["account", "order", id],
    queryFn: () => getMyOrder(id),
  });

  if (isPending) {
    return (
      <div className="px-4 pb-4">
        <Loader2 className="size-4 animate-spin text-brand" />
      </div>
    );
  }
  if (isError) {
    return <p className="px-4 pb-4 text-sm text-rose-600">{t("errors.network")}</p>;
  }

  return (
    <ul className="mx-4 mb-4 flex flex-col gap-2 border-t border-line/70 pt-3">
      {data.items.map((item) => (
        <li key={item.productId} className="flex justify-between gap-3 text-sm">
          <span className="text-muted-ink">
            {item.productName[locale] ?? item.productName.ru}
            <span className="text-muted-ink/70"> × {item.quantity}</span>
          </span>
          <span className="whitespace-nowrap font-medium text-ink">
            {formatAmount(Number(item.subtotal))}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── purchase history ────────────────────────────────────────────────────── */

function PurchasesPanel() {
  const t = useTranslations("Account");
  const locale = useLocale() as AppLocale;
  const { data, isPending, isError } = useQuery({
    queryKey: ["account", "purchases"],
    queryFn: getPurchases,
  });

  return (
    <section className={PANEL}>
      <PanelHead
        icon={<ReceiptText className="size-4" />}
        title={t("purchases")}
        hint={t("purchasesHint")}
      />

      {isPending ? (
        <Loader2 className="mt-5 size-5 animate-spin text-brand" />
      ) : isError ? (
        <p className="mt-5 text-sm text-rose-600">{t("errors.network")}</p>
      ) : !data?.purchases.length ? (
        <EmptyState icon={<ReceiptText className="size-4" />} text={t("noPurchases")} />
      ) : (
        // Already newest-first from the API; re-sorting could only disagree.
        <ol className="mt-5 flex flex-col border-l border-line/80 pl-4">
          {data.purchases.map((purchase) => (
            <PurchaseRow
              key={`${purchase.source}-${purchase.id}`}
              purchase={purchase}
              locale={locale}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function PurchaseRow({ purchase, locale }: { purchase: Purchase; locale: AppLocale }) {
  const t = useTranslations("Account");
  const fromCrm = purchase.source === "crm";

  return (
    <li className="relative py-4 first:pt-0 last:pb-0">
      {/* The dot ties the row to the rule on the left, so the list reads as a
          history rather than as another stack of cards. */}
      <span
        aria-hidden
        className={cn(
          "absolute -left-[1.3125rem] top-5 size-2.5 rounded-full ring-4 ring-white first:top-1.5",
          fromCrm ? "bg-muted-ink/40" : "bg-brand",
        )}
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold break-words text-ink">
            {fromCrm ? (purchase.title ?? t("managerPurchase")) : `#${purchase.id.slice(0, 8)}`}
          </p>
          <p className="mt-0.5 text-xs text-muted-ink">
            {new Date(purchase.date).toLocaleDateString(locale)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {fromCrm ? (
            <span className="rounded-full px-2.5 py-1 text-[0.6875rem] font-medium text-muted-ink ring-1 ring-line">
              {t("viaManager")}
            </span>
          ) : (
            <>
              <StoreTag store={purchase.store} />
              {purchase.status && <StatusPill status={purchase.status} />}
            </>
          )}
          {/* `amount` is already in sums — nothing to divide here. */}
          <span className="font-heading text-base font-extrabold whitespace-nowrap text-ink">
            {formatAmount(purchase.amount)}
          </span>
        </div>
      </div>

      {purchase.items.length > 0 && (
        <ul className="mt-2.5 flex flex-col gap-1 rounded-lg bg-surface-soft/70 px-3 py-2">
          {purchase.items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex justify-between gap-3 text-[0.8125rem]"
            >
              <span className="text-muted-ink">
                {item.name}
                <span className="text-muted-ink/70"> × {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap text-ink">
                {formatAmount(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
