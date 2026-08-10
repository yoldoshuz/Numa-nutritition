"use client";

import { Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/lib/i18n/navigation";
import { formatUzPhoneInput } from "@/lib/phone";
import { cn } from "@/lib/utils";

type FieldName = "name" | "phone" | "question";
type Errors = Partial<Record<FieldName, string>>;

const phonePattern = /^[+()\d\s-]{9,20}$/;

export function ConsultationForm() {
  const t = useTranslations("Consultation");
  const tCommon = useTranslations("Common");

  const [values, setValues] = useState({ name: "", phone: "", question: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = t("errors.name");
    if (!phonePattern.test(values.phone.trim())) next.phone = t("errors.phone");
    if (values.question.trim().length < 5) next.question = t("errors.question");
    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // Replaced with the real endpoint once the backend is connected.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    setDone(true);
    setValues({ name: "", phone: "", question: "" });
  }

  function update(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (!errors[field]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  const inputClass =
    "h-12 rounded-lg border-line bg-white px-4 text-sm placeholder:text-muted-ink/70";

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-[0.8125rem] font-bold text-ink">
              {t("name")}
              <span className="text-brand">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder={t("namePlaceholder")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={inputClass}
            />
            {errors.name ? (
              <p id="name-error" className="text-xs text-red-500">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone" className="text-[0.8125rem] font-bold text-ink">
              {t("phone")}
              <span className="text-brand">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) =>
                update("phone", formatUzPhoneInput(event.target.value))
              }
              placeholder={t("phonePlaceholder")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={inputClass}
            />
            {errors.phone ? (
              <p id="phone-error" className="text-xs text-red-500">
                {errors.phone}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="question" className="text-[0.8125rem] font-bold text-ink">
            {t("question")}
            <span className="text-brand">*</span>
          </Label>
          <Textarea
            id="question"
            name="question"
            rows={4}
            value={values.question}
            onChange={(event) => update("question", event.target.value)}
            placeholder={t("questionPlaceholder")}
            aria-invalid={Boolean(errors.question)}
            aria-describedby={errors.question ? "question-error" : undefined}
            className="min-h-32 rounded-lg border-line bg-white p-4 text-sm placeholder:text-muted-ink/70"
          />
          {errors.question ? (
            <p id="question-error" className="text-xs text-red-500">
              {errors.question}
            </p>
          ) : null}
        </div>

        <p className="flex items-start gap-3 rounded-lg bg-white/90 p-4 text-[0.8125rem] leading-relaxed text-muted-ink shadow-card">
          <Info className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>
            {t("privacy")}
            <br />
            {t("privacySecond")}
          </span>
        </p>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex h-13 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white transition-all duration-200 hover:bg-brand-600 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            submitting && "opacity-70"
          )}
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </form>

      {done ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="consultation-success"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/25 p-4 backdrop-blur-sm"
        >
          <div className="animate-fade-up relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-float">
            <button
              type="button"
              onClick={() => setDone(false)}
              aria-label={tCommon("close")}
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-brand-200 text-brand transition-colors hover:bg-brand-50"
            >
              <X className="size-4" />
            </button>

            <p id="consultation-success" className="font-heading text-base font-bold text-ink">
              {t("successTitle")}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">{t("successText")}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">{t("successTime")}</p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white transition-colors hover:bg-brand-600"
              >
                {tCommon("backHome")}
              </Link>
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-full border border-brand text-sm font-bold text-brand transition-colors hover:bg-brand-50"
              >
                {tCommon("goToCatalog")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
