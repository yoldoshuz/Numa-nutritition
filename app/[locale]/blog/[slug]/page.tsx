import Image from "next/image";
import type { Metadata } from "next";
import { Clock, FileText } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CtaBand } from "@/components/layout/cta-band";
import { ShareLinks } from "@/components/pages/blog/share-links";
import { BlogCard } from "@/components/shared/blog-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Container } from "@/components/shared/container";
import { JsonLd } from "@/components/shared/json-ld";
import { ProductCard } from "@/components/shared/product-card";
import { getArticleProducts, getBlogPost, getRelatedPosts } from "@/lib/api/catalog";
import { blogPosts as staticBlogPosts } from "@/lib/data/content";
import { formatDate } from "@/lib/format";
import { locales } from "@/lib/i18n/routing";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { AppLocale } from "@/types";

type Params = Promise<{ locale: AppLocale; slug: string }>;

interface Section {
  heading: string;
  text: string;
}

/**
 * Prerenders the articles the storefront ships with; posts published later in
 * the CMS render on first request, so the build needs no backend.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    staticBlogPosts.map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  const t = await getTranslations({ locale, namespace: `Blog.posts.${slug}` });
  const tMeta = await getTranslations({ locale, namespace: "Meta.articleTemplate" });

  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: tMeta("title", { title: t("title") }),
    description: t("excerpt"),
    images: [post.cover],
    type: "article",
    publishedTime: post.date,
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getBlogPost(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: `Blog.posts.${slug}` });
  const tBlog = await getTranslations({ locale, namespace: "Blog" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const sections = t.raw("sections") as Section[];
  const related = await getRelatedPosts(slug);
  // What the article is about, offered for sale where the reader finishes it.
  const { products: articleProducts, note: articleNote } = await getArticleProducts(slug);
  const url = localizedUrl(locale, `/blog/${slug}`);

  return (
    <>
      <article className="pt-6 pb-14 lg:pb-20">
        <Container className="max-w-prose-page">
          <Breadcrumbs
            items={[
              { name: tNav("home"), href: "/" },
              { name: tNav("blog"), href: "/blog" },
              { name: t("title") },
            ]}
          />

          <span className="mt-5 inline-flex items-center rounded-md bg-brand px-3 py-1 text-[0.625rem] font-bold tracking-wide text-white uppercase">
            {tBlog(`categories.${post.category}`)}
          </span>

          <h1 className="mt-4 font-heading text-[1.75rem] leading-tight font-extrabold text-ink sm:text-4xl">
            {t("title")}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-[0.8125rem] text-muted-ink">
            <span className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand">
                <FileText className="size-4" />
              </span>
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            </span>
            <span className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand">
                <Clock className="size-4" />
              </span>
              {tBlog("readingTime", { minutes: post.readingMinutes })}
            </span>
          </div>

          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-surface-soft">
            <Image
              src={post.cover}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 820px"
              className="object-cover"
            />
          </div>

          <p className="mt-7 text-[0.9375rem] leading-relaxed text-ink-soft">{t("lead")}</p>

          {sections.map((section, index) => (
            <section key={section.heading} className="mt-7">
              <h2 className="font-heading text-lg font-extrabold text-ink sm:text-xl">
                {section.heading}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-ink">
                {section.text}
              </p>

              {index === 2 && post.figures?.length ? (
                <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                  {post.figures.map((figure) => (
                    <li
                      key={figure}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-200 bg-surface-mint"
                    >
                      <Image
                        src={figure}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 260px"
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <p className="mt-7 text-[0.9375rem] leading-relaxed text-ink-soft">{t("outro")}</p>

          {articleProducts.length > 0 ? (
            <aside className="mt-12 rounded-2xl border border-brand-200 bg-surface-mint p-6 sm:p-8">
              <h2 className="font-heading text-xl font-extrabold text-ink sm:text-2xl">
                {tBlog("buy.title")}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-ink">
                {articleNote ?? tBlog("buy.subtitle")}
              </p>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {articleProducts.map((product) => (
                  <li key={product.slug} className="h-full">
                    <ProductCard product={product} className="h-full" />
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <div className="mt-8 border-t border-line pt-6">
            <ShareLinks url={url} title={t("title")} />
          </div>
        </Container>
      </article>

      <section className="pb-14 lg:pb-20">
        <Container>
          <h2 className="font-heading text-2xl font-extrabold text-ink sm:text-[2rem]">
            {tBlog("relatedTitle")}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="h-full">
                <BlogCard post={item} className="h-full" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand variant="needHelp" />

      <JsonLd
        data={[
          articleJsonLd({ locale, post, title: t("title"), description: t("excerpt") }),
          breadcrumbJsonLd(locale, [
            { name: tNav("home"), path: "/" },
            { name: tNav("blog"), path: "/blog" },
            { name: t("title"), path: `/blog/${slug}` },
          ]),
        ]}
      />
    </>
  );
}
