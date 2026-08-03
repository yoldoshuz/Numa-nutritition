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

        <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center rounded-full bg-surface-mint">
          <Image
            src={product.statImage}
            alt=""
            width={420}
            height={420}
            sizes="(max-width: 1024px) 70vw, 380px"
            className="size-[78%] rounded-full object-contain"
          />
        </div>
      </Container>
    </section>
  );
}
