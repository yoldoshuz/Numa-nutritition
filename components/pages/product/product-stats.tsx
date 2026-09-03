import Image from "next/image";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { StatBar } from "@/components/shared/stat-bar";
import type { ProductContent } from "@/lib/api/blocks";
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

  return (
    <section className="pb-14 lg:pb-20">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
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

        {/*
          The photo is positioned out of flow on purpose.

          As an in-flow child its `78%` height had nothing definite to resolve
          against — `aspect-square` only derives a height once the content is
          measured — so it fell back to the file's own proportions. An upright
          packshot is roughly 1:3, which stretched this circle into a 384×950
          capsule with the bottle spilling out of the mint. Out of flow the
          image no longer feeds the container's height, so the square resolves
          from the width first and both percentages land on the same 384px.
        */}
        <div className="relative mx-auto aspect-square w-full max-w-sm rounded-full bg-surface-mint">
          <Image
            src={product.statImage}
            alt=""
            width={420}
            height={420}
            sizes="(max-width: 1024px) 70vw, 380px"
            className="absolute top-1/2 left-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full object-contain"
          />
        </div>
      </Container>
    </section>
  );
}
