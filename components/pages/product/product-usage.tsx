import Image from "next/image";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import type { Product } from "@/types";

interface Step {
  title: string;
  text: string;
}

export function ProductUsage({ product }: { product: Product }) {
  const t = useTranslations(`Product.${product.slug}`);
  const tProduct = useTranslations("Product");

  const steps = t.raw("steps") as Step[];
  const important = tProduct.raw("important") as string[];

  return (
    <section className="py-14 lg:py-18">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
            {tProduct("usageTitle", { name: t("name") })}
          </h2>
          <p className="text-sm leading-relaxed text-muted-ink">
            {tProduct("usageSubtitle")}
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8">
          <ol className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-stretch gap-3">
                <span className="mt-1 grid size-9 shrink-0 place-items-center self-start rounded-full border-2 border-brand font-heading text-sm font-extrabold text-brand">
                  {index + 1}
                </span>
                <div className="flex-1 rounded-lg bg-brand px-4 py-3 text-white">
                  <p className="text-[0.8125rem] font-bold">{step.title}</p>
                  <p className="mt-0.5 text-[0.75rem] leading-relaxed text-white/90">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/*
            Every box below letterboxes rather than crops: these slots are
            filled from the product's uploaded photos, which are as often an
            upright packshot as a wide frame, and a cover-crop of a bottle is a
            slice of its label blown up past the point of recognition.
          */}
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-mint sm:aspect-[4/3]">
              <Image
                src={product.usage.small[0]}
                alt=""
                fill
                sizes="(max-width: 1024px) 60vw, 380px"
                className="object-contain"
              />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-mint sm:aspect-auto">
              <Image
                src={product.usage.small[1]}
                alt=""
                fill
                sizes="(max-width: 1024px) 40vw, 260px"
                className="object-contain"
              />
            </div>

            {/*
              Two panels rather than text over a picture: the product keeps a
              plate of its own and the rules keep a dark green one, so nothing
              has to be dimmed and the copy never lands on a label.

              Stacked on a phone — product above, rules below — and split in
              half from `sm`, photo on the left. Neither panel takes its height
              from the image file, which is what used to stretch this block to
              517px when the slot held an upright packshot.
            */}
            <div className="overflow-hidden rounded-2xl bg-surface-mint sm:col-span-2 sm:grid sm:min-h-96 sm:grid-cols-2">
              <div className="relative aspect-[16/10] w-full sm:aspect-auto sm:h-full">
                <Image
                  src={product.usage.wide}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 330px"
                  className="object-contain p-4"
                />
              </div>

              <div className="flex flex-col justify-center gap-2 bg-gradient-to-t from-brand-900 to-brand-700 p-6 sm:bg-gradient-to-r sm:p-8">
                <p className="text-sm font-bold text-white">{tProduct("importantTitle")}</p>
                <ul className="flex flex-col gap-1.5">
                  {important.map((rule) => (
                    <li
                      key={rule}
                      className="text-[0.6875rem] leading-snug text-white/90 before:mr-1.5 before:content-['•']"
                    >
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
