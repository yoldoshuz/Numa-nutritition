import { getTranslations } from "next-intl/server";

import { BlogCard } from "@/components/shared/blog-card";
import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { SectionHeading } from "@/components/shared/section-heading";
import { getBlogPosts } from "@/lib/api/catalog";
import { Link } from "@/lib/i18n/navigation";

export async function BlogHighlights() {
  const t = await getTranslations("Home.blog");
  const tCommon = await getTranslations("Common");
  const posts = await getBlogPosts();
  // CMS-authored posts carry no `featured` flag, so the newest three stand in
  // once the shipped catalogue is superseded.
  const highlighted = posts.filter((post) => post.featured);
  const featured = (highlighted.length ? highlighted : posts).slice(0, 3);

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
