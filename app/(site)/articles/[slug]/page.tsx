import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/url";
import { buildArticleJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SectionHeading } from "@/components/site/section-heading";

interface ArticlePageProps {
  params: { slug: string };
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.status !== "PUBLISHED") {
    return null;
  }
  return article;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) {
    return { title: "文章未找到" };
  }
  return {
    title: article.title,
    description: article.excerpt ?? article.content.slice(0, 80),
    openGraph: {
      title: article.title,
      description: article.excerpt ?? article.content.slice(0, 120),
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
      type: "article",
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const crumbs = [
    { label: "首页", href: "/" },
    { label: "文章", href: "/articles" },
    { label: article.title },
  ];

  const siteUrl = getSiteUrl();
  const structuredData = buildArticleJsonLd(
    {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    },
    siteUrl
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <script
        type="application/ld+json"
        // 注入文章结构化数据，帮助搜索引擎理解发布时间与摘要。
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs items={crumbs} />
      <SectionHeading
        eyebrow={article.publishedAt?.toLocaleDateString("zh-CN") ?? undefined}
        title={article.title}
        description={article.excerpt ?? ""}
      />
      {article.coverImage ? (
        <div className="relative h-72 w-full overflow-hidden rounded-[32px] border border-border/60">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      ) : null}
      <article className="space-y-6 text-base leading-8 text-muted-foreground">
        {article.content.split(/\n\n+/).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </article>
    </div>
  );
}
