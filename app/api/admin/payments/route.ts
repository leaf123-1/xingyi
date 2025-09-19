import { NextResponse } from "next/server";
import { PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";

export const GET = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const take = 30;
  const skip = (Math.max(page, 1) - 1) * take;
  const where: Prisma.PaymentWhereInput = {};
  if (provider && provider in PaymentProvider) {
    where.provider = provider as PaymentProvider;
  }
  if (status && status in PaymentStatus) {
    where.status = status as PaymentStatus;
  }
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: { id: true, orderNumber: true, status: true, totalAmount: true },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);
  return NextResponse.json({ data: payments, total, page, pageSize: take });
});
