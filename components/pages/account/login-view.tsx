"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/shared/container";
import { useAuth } from "@/hooks";
import {
  classifyAuthError,
  registerCustomer,
  requestLoginOtp,
  type AuthFailure,
} from "@/lib/api/account";
import { normalizePhone } from "@/lib/api/checkout";
import { formatUzPhoneInput, UZ_PHONE_PREFIX } from "@/lib/phone";
import { cn } from "@/lib/utils";

/**
 * Signing in and registering are separate choices rather than one flow that
 * works out which is which. `/auth/login` answers the same for a number with an
 * account and one without — deliberately, so the form cannot be used to find
 * out who is a customer — so there is nothing to branch on.
 */
type Mode = "signIn" | "register";

export function LoginView({ next }: { next: string }) {
  const t = useTranslations("Account");
  const router = useRouter();
  const { verifyOtp } = useAuth();

  const [mode, setMode] = useState<Mode>("signIn");
  const [phone, setPhone] = useState(UZ_PHONE_PREFIX);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthFailure | "phone" | "name" | null>(null);

  async function sendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const apiPhone = normalizePhone(phone);
    if (!apiPhone) return setError("phone");
    if (mode === "register" && firstName.trim().length < 2) return setError("name");

    setError(null);
    setBusy(true);
    try {
      if (mode === "register") {
        await registerCustomer({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          phone: apiPhone,
        });
      } else {
        await requestLoginOtp(apiPhone);
      }
      setSent(true);
    } catch (cause) {
      setError(classifyAuthError(cause, "request"));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const apiPhone = normalizePhone(phone);
    if (!apiPhone) return setError("phone");

    setError(null);
    setBusy(true);
    try {
      await verifyOtp(apiPhone, otp.trim());
      router.replace(next);
    } catch (cause) {
      setError(classifyAuthError(cause, "verify"));
    } finally {
      setBusy(false);
    }
  }

  const field =
    "h-12 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted-ink/70 focus:border-brand";

  return (
    // A card, like the other two shops: full-bleed on the page the form read as
    // a stretched fragment rather than a thing to fill in.
    <section className="bg-surface-soft/60 py-12 sm:py-16">
      <Container>
        <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-line/70 sm:p-8">
        <h1 className="font-heading text-2xl font-extrabold text-ink sm:text-3xl">
          {t(sent ? "codeTitle" : mode === "register" ? "registerTitle" : "signInTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-ink">
          {sent ? t("codeSubtitle", { phone }) : t("signInSubtitle")}
        </p>

        {!sent && (
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-soft p-1">
            {(["signIn", "register"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  setError(null);
                }}
                className={cn(
                  "h-10 rounded-md text-sm font-semibold transition-colors",
                  mode === option
                    ? "bg-white text-ink shadow-card"
                    : "text-muted-ink hover:text-ink",
                )}
              >
                {t(option === "register" ? "registerTab" : "signInTab")}
              </button>
            ))}
          </div>
        )}

        {sent ? (
          <form onSubmit={confirmCode} noValidate className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.8125rem] font-bold text-ink">{t("code")}</span>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="0000"
                className={`${field} tracking-[0.4em]`}
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-500">
                {t(`errors.${error}`)}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || otp.length < 4}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {t("confirm")}
            </button>

            <button
              type="button"
              onClick={() => {
                setSent(false);
                setOtp("");
                setError(null);
              }}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              {t("changePhone")}
            </button>
          </form>
        ) : (
          <form onSubmit={sendCode} noValidate className="mt-6 flex flex-col gap-4">
            {mode === "register" && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.8125rem] font-bold text-ink">
                    {t("firstName")}
                  </span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    autoComplete="given-name"
                    className={field}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.8125rem] font-bold text-ink">
                    {t("lastName")}
                  </span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    autoComplete="family-name"
                    className={field}
                  />
                </label>
              </>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.8125rem] font-bold text-ink">{t("phone")}</span>
              <input
                value={phone}
                onChange={(event) => setPhone(formatUzPhoneInput(event.target.value))}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={field}
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-500">
                {t(`errors.${error}`)}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {t("sendCode")}
            </button>
          </form>
        )}
        </div>
        </div>
      </Container>
    </section>
  );
}
