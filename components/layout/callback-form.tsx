"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  classifySupportRequestError,
  postSupportRequest,
} from "@/lib/api/support-request";
import { formatUzPhoneInput, toApiPhone, UZ_PHONE_PREFIX } from "@/lib/phone";

type State = "idle" | "sending" | "done" | "invalid" | "rateLimit" | "network";

/**
 * The footer's "leave your number" block.
 *
 * Deliberately not the consultation form: that one asks for a name and a
 * description of the problem, and the two live in separate tables and separate
 * sections of the admin panel. One field is the whole point — the manager asks
 * for everything else in the first seconds of the call.
 */
export function CallbackForm() {
  const t = useTranslations("Callback");
  const [phone, setPhone] = useState(UZ_PHONE_PREFIX);
  const [state, setState] = useState<State>("idle");

  const busy = state === "sending" || state === "done";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const apiPhone = toApiPhone(phone);
    if (!apiPhone) {
      setState("invalid");
      return;
    }

    setState("sending");
    try {
      await postSupportRequest(apiPhone);
      setState("done");
    } catch (error) {
      // A 429 is the anti-spam cap, not a fault: never retry it for the
      // visitor, or a shared office IP keeps hitting the same wall.
      const failure = classifySupportRequestError(error);
      setState(failure === "validation" ? "invalid" : failure);
    }
  }

  const message =
    state === "done"
      ? t("success")
      : state === "invalid"
        ? t("errorPhone")
        : state === "rateLimit"
          ? t("errorRateLimit")
          : state === "network"
            ? t("errorNetwork")
            : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <p className="text-sm font-bold">{t("title")}</p>
      <p className="max-w-xs text-[0.9375rem] leading-relaxed text-white/85">
        {t("hint")}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => {
            setPhone(formatUzPhoneInput(event.target.value));
            if (state === "invalid") setState("idle");
          }}
          disabled={busy}
          aria-label={t("phoneLabel")}
          placeholder={UZ_PHONE_PREFIX}
          className="h-11 min-w-0 flex-1 rounded-full border border-white/30 bg-white/10 px-4 text-[0.9375rem] text-white placeholder:text-white/50 focus-visible:border-white focus-visible:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-11 shrink-0 rounded-full bg-white px-6 text-sm font-bold text-brand transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:translate-y-0 disabled:opacity-60"
        >
          {state === "sending" ? t("sending") : t("submit")}
        </button>
      </div>
      {message ? (
        <p
          role={state === "done" ? "status" : "alert"}
          className={`text-sm ${state === "done" ? "text-white" : "text-red-200"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
