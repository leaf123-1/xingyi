import { prisma } from "@/lib/prisma";
import { PageManager } from "@/components/admin/page-manager";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
  const formatted = pages.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    status: page.status,
    publishedAt: page.publishedAt ? page.publishedAt.toISOString().slice(0, 16) : null,
  }));
  return <PageManager pages={formatted} />;
}
