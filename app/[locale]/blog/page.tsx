import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CtaBand } from "@/components/layout/cta-band";
import { BlogHero } from "@/components/pages/blog/blog-hero";
import { BlogCard } from "@/components/shared/blog-card";
import { Container } from "@/components/shared/container";
import { JsonLd } from "@/components/shared/json-ld";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { blogPosts } from "@/lib/data/content";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta.blog" });

  return buildMetadata({
    locale,
    path: "/blog",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Blog" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const popular = blogPosts.filter((post) => post.featured).slice(0, 2);
  const latest = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <BlogHero />

      <section id="popular" className="scroll-mt-28 py-12 lg:py-16">
        <Container>
          <h2 className="font-heading text-2xl font-extrabold text-ink sm:text-[2rem]">
            {t("popular")}
          </h2>
          <ul className="mt-6 grid gap-5 lg:grid-cols-2">
            {popular.map((post) => (
              <li key={post.slug} className="h-full">
                <BlogCard post={post} showDate className="h-full" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="latest" className="relative isolate scroll-mt-28 pb-14 lg:pb-20">
        <LeafDecor corners={["bottom-right"]} />
        <Container>
          <h2 className="font-heading text-2xl font-extrabold text-ink sm:text-[2rem]">
            {t("latest")}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <li key={post.slug} className="h-full">
                <BlogCard post={post} showDate className="h-full" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand variant="needHelp" />

      <JsonLd
        data={[
          itemListJsonLd(
            locale,
            blogPosts.map((post) => ({
              name: t(`posts.${post.slug}.title`),
              path: `/blog/${post.slug}`,
            }))
          ),
          breadcrumbJsonLd(locale, [
            { name: tNav("home"), path: "/" },
            { name: tNav("blog"), path: "/blog" },
          ]),
        ]}
      />
    </>
  );
}
