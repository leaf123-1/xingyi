import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";

const paramsSchema = z.object({ id: z.string().min(1) });

const guard = withRole(["ADMIN", "EDITOR"], async (_ctx, _request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: { include: { product: true, variant: true } },
        },
      },
    },
  });
  if (!payment) {
    return NextResponse.json({ message: "支付记录不存在" }, { status: 404 });
  }
  return NextResponse.json(payment);
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
