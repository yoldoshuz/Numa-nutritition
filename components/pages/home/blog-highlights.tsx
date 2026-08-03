import { useTranslations } from "next-intl";

import { BlogCard } from "@/components/shared/blog-card";
import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { SectionHeading } from "@/components/shared/section-heading";
import { blogPosts } from "@/lib/data/content";
import { Link } from "@/lib/i18n/navigation";

export function BlogHighlights() {
  const t = useTranslations("Home.blog");
  const tCommon = useTranslations("Common");
  const featured = blogPosts.filter((post) => post.featured).slice(0, 3);

  return (
    <section className="relative isolate py-14 lg:py-20">
      <LeafDecor position="left" />
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          action={
            <Link
              href="/blog"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-300 px-5 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {tCommon("allArticles")}
            </Link>
          }
        />

        <ul className="mt-8 grid gap-5 lg:grid-cols-3">
          {featured.map((post) => (
            <li key={post.slug} className="h-full">
              <BlogCard post={post} orientation="horizontal" className="h-full" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
