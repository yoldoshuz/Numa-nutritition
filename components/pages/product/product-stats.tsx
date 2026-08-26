import Image from "next/image";
import { useTranslations } from "next-intl";

import { Container } from "@/components/shared/container";
import { StatBar } from "@/components/shared/stat-bar";
import type { Product } from "@/types";

interface Stat {
  label: string;
  text: string;
}

export function ProductStats({ product }: { product: Product }) {
  const t = useTranslations(`Product.${product.slug}`);
  const stats = t.raw("stats") as Stat[];

  return (
    <section className="pb-14 lg:pb-20">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <ul className="flex flex-col gap-5">
          {stats.map((stat, index) => (
            <li key={stat.label}>
              <StatBar
                label={stat.label}
                text={stat.text}
                value={product.statValues[index] ?? 90}
              />
            </li>
          ))}
        </ul>

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
