import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "文章与洞察",
  description: "阅读产品使用技巧、赛事经验与系统搭建心得。",
};

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16">
      <SectionHeading
        eyebrow="知识库"
        title="从使用技巧到系统搭建的全链路洞察"
        description="内容团队会持续输出赛事经验、装备保养与后台运营策略，帮助品牌维护社区关系。"
      />
      {articles.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={
                    article.coverImage ??
                    "https://images.unsplash.com/photo-1542293787938-4d2226c3d8a9?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={article.title}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {article.publishedAt?.toLocaleDateString("zh-CN") ?? "未发布日期"}
                </span>
                <h2 className="text-lg font-semibold text-foreground">{article.title}</h2>
                <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                <Link
                  href={`/articles/${article.slug}`}
                  prefetch
                  className="mt-auto inline-flex items-center text-sm font-semibold text-primary"
                >
                  阅读全文
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          文章内容筹备中，敬请期待。
        </div>
      )}
    </div>
  );
}
