import { NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";

export const GET = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const take = 20;
  const skip = (Math.max(page, 1) - 1) * take;
  const where: Prisma.OrderWhereInput = {};
  if (status && status in OrderStatus) {
    where.status = status as OrderStatus;
  }
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        payments: true,
        items: {
          include: { product: true, variant: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);
  return NextResponse.json({ data: orders, total, page, pageSize: take });
});
