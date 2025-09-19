import { NextResponse } from "next/server";
import { ContactStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";

export const GET = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const take = 30;
  const skip = (Math.max(page, 1) - 1) * take;
  const where: Prisma.ContactMessageWhereInput = {};
  if (status && status in ContactStatus) {
    where.status = status as ContactStatus;
  }
  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contactMessage.count({ where }),
  ]);
  return NextResponse.json({ data: messages, total, page, pageSize: take });
});
