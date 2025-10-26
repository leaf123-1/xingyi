import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { categoryInputSchema } from "./schema";

export const GET = withRole(["ADMIN", "EDITOR"], async () => {
  const categories = await prisma.category.findMany({
    include: {
      children: true,
    },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ data: categories });
});

export const POST = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const payload = categoryInputSchema.parse(await request.json());
  const category = await prisma.category.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      sort: payload.sort ?? 0,
      parentId: payload.parentId ?? null,
    },
    include: { children: true },
  });
  return NextResponse.json(category, { status: 201 });
});
