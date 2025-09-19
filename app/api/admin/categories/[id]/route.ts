import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { categoryInputSchema } from "../schema";

const paramsSchema = z.object({ id: z.string().min(1) });

const guard = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  if (request.method === "GET") {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category) {
      return NextResponse.json({ message: "分类不存在" }, { status: 404 });
    }
    return NextResponse.json(category);
  }
  if (request.method === "PUT") {
    const payload = categoryInputSchema.parse(await request.json());
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: payload.name,
        slug: payload.slug,
        sort: payload.sort ?? 0,
        parentId: payload.parentId ?? null,
      },
      include: { children: true },
    });
    return NextResponse.json(category);
  }
  if (request.method === "DELETE") {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ message: "不支持的请求" }, { status: 405 });
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const PUT = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const DELETE = (request: Request, context: { params: { id: string } }) => guard(request, context);
