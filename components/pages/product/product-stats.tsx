import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { SlotImage } from "@/components/shared/slot-image";
import { StatBar } from "@/components/shared/stat-bar";
import type { ProductContent } from "@/lib/api/blocks";
import { hasSlots } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Stat {
  label: string;
  text: string;
}

export function ProductStats({
  product,
  content,
}: {
  product: Product;
  content?: ProductContent;
}) {
  const t = useTranslations(`Product.${product.slug}`);

  /*
   * The admin's "шкалы эффективности" block carries its own percentages, so a
   * CMS row no longer has to line up with `statValues` — that array is seed
   * data no screen edits, and a fifth stat added in the CMS used to fall back
   * to a flat 90%.
   */
  const cms = content?.metrics;
  const stats: Stat[] =
    cms?.items.map((item) => ({ label: item.title, text: item.description })) ??
    (t.raw("stats") as Stat[]);

  /*
   * The photo belongs to this block: `metrics_1`. It used to be the second
   * upload — the gallery's own second frame — inside a mint circle, which is
   * also why the frame had to fight the file's proportions to stay round. A 4:3
   * plate holds a 4:3 slot without either of them giving way, and with the slot
   * empty the bars take the whole width.
   */
  const illustrated = hasSlots(product.images, "metrics_1");

  return (
    <section className="pb-14 lg:pb-20">
      <Container
        className={cn(
          "grid items-center gap-10",
          illustrated && "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14",
        )}
      >
        <div>
          {/*
            The design gives this block no heading, because the bundled stats
            needed no introduction. A block written in the admin can have one,
            and dropping it would mean a moderator typing a title into a field
            that does nothing.
          */}
          {cms?.title && (
            <h2 className="mb-7 font-heading text-2xl leading-tight font-extrabold text-ink sm:text-[2rem]">
              {cms.title}
            </h2>
          )}
          <ul className="flex flex-col gap-5">
            {stats.map((stat, index) => (
              <li key={stat.label + index}>
                <StatBar
                  label={stat.label}
                  text={stat.text}
                  value={cms?.items[index]?.percent ?? product.statValues[index] ?? 90}
                />
              </li>
            ))}
          </ul>
        </div>

        <SlotImage
          images={product.images}
          slot="metrics_1"
          alt={t("name")}
          sizes="(max-width: 1024px) 100vw, 420px"
          className="mx-auto w-full max-w-sm rounded-2xl bg-surface-mint"
          imageClassName="p-4"
        />
      </Container>
    </section>
  );
}
