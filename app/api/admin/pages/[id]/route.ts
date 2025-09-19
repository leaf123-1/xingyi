import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { pageInputSchema } from "../schema";

const paramsSchema = z.object({ id: z.string().min(1) });

const guard = withRole(["ADMIN", "EDITOR"], async ({ session }, request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  if (request.method === "GET") {
    const page = await prisma.page.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!page) {
      return NextResponse.json({ message: "页面不存在" }, { status: 404 });
    }
    return NextResponse.json(page);
  }
  if (request.method === "PUT") {
    const payload = pageInputSchema.parse(await request.json());
    const page = await prisma.page.update({
      where: { id },
      data: {
        title: payload.title,
        slug: payload.slug,
        content: payload.content,
        status: payload.status,
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
        authorId: session.user.id,
      },
      include: { author: true },
    });
    return NextResponse.json(page);
  }
  if (request.method === "DELETE") {
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ message: "不支持的请求" }, { status: 405 });
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const PUT = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const DELETE = (request: Request, context: { params: { id: string } }) => guard(request, context);
