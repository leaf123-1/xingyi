import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { articleInputSchema } from "../schema";

const paramsSchema = z.object({ id: z.string().min(1) });

const guard = withRole(["ADMIN", "EDITOR"], async ({ session }, request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  if (request.method === "GET") {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!article) {
      return NextResponse.json({ message: "文章不存在" }, { status: 404 });
    }
    return NextResponse.json(article);
  }
  if (request.method === "PUT") {
    const payload = articleInputSchema.parse(await request.json());
    const article = await prisma.article.update({
      where: { id },
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
    return NextResponse.json(article);
  }
  if (request.method === "DELETE") {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ message: "不支持的请求" }, { status: 405 });
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const PUT = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const DELETE = (request: Request, context: { params: { id: string } }) => guard(request, context);
