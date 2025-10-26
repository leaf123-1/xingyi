import { NextResponse } from "next/server";
import { PublishStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { articleInputSchema } from "./schema";

export const GET = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const where: Prisma.ArticleWhereInput = {};
  if (status && status in PublishStatus) {
    where.status = status as PublishStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 200,
  });
  return NextResponse.json({ data: articles });
});

export const POST = withRole(["ADMIN", "EDITOR"], async ({ session }, request: Request) => {
  const payload = articleInputSchema.parse(await request.json());
  const article = await prisma.article.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt,
      content: payload.content,
      coverImage: payload.coverImage,
      status: payload.status,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
      authorId: session.user.id,
    },
    include: { author: true },
  });
  return NextResponse.json(article, { status: 201 });
});
