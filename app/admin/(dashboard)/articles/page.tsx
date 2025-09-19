import { prisma } from "@/lib/prisma";
import { ArticleManager } from "@/components/admin/article-manager";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formatted = articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? undefined,
    content: article.content,
    coverImage: article.coverImage ?? undefined,
    status: article.status,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString().slice(0, 16) : null,
  }));

  return <ArticleManager articles={formatted} />;
}
