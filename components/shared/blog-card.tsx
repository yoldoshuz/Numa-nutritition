import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Link } from "@/lib/i18n/navigation";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppLocale, BlogPost } from "@/types";

interface BlogCardProps {
  post: BlogPost;
  orientation?: "horizontal" | "vertical";
  showDate?: boolean;
  className?: string;
}

export function BlogCard({
  post,
  orientation = "vertical",
  showDate = false,
  className,
}: BlogCardProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Common");
  const tBlog = useTranslations("Blog");
  const tPost = useTranslations(`Blog.posts.${post.slug}`);
  const href = `/blog/${post.slug}`;

  const horizontal = orientation === "horizontal";

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        horizontal ? "flex-col sm:flex-row" : "flex-col",
        className
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-surface-soft",
          horizontal ? "h-44 sm:h-auto sm:w-2/5" : "h-48"
        )}
      >
        <Image
          src={post.cover}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-brand px-2.5 py-1 text-[0.625rem] font-bold tracking-wide text-white uppercase">
            {tBlog(`categories.${post.category}`)}
          </span>
          {showDate ? (
            <time dateTime={post.date} className="text-xs text-muted-ink">
              {formatDate(post.date, locale)}
            </time>
          ) : null}
        </div>

        <h3 className="font-heading text-[0.95rem] leading-snug font-bold text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {tPost("title")}
          </Link>
        </h3>

        <p className="line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-ink">
          {tPost("excerpt")}
        </p>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[0.8125rem] font-semibold text-brand transition-transform duration-200 group-hover:translate-x-0.5">
          {horizontal ? t("readArticle") : t("readMore")}
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </article>
  );
}
