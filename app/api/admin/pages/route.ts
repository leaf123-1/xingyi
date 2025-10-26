import { NextResponse } from "next/server";
import { PublishStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { pageInputSchema } from "./schema";

export const GET = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const where: Prisma.PageWhereInput = {};
  if (status && status in PublishStatus) {
    where.status = status as PublishStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  const pages = await prisma.page.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 200,
  });
  return NextResponse.json({ data: pages });
});

export const POST = withRole(["ADMIN", "EDITOR"], async ({ session }, request: Request) => {
  const payload = pageInputSchema.parse(await request.json());
  const page = await prisma.page.create({
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
  return NextResponse.json(page, { status: 201 });
});
