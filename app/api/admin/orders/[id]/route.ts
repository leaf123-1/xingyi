import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { orderUpdateSchema } from "../schema";

const paramsSchema = z.object({ id: z.string().min(1) });

function parseMetadata(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("订单元数据 JSON 解析失败", error);
      return undefined;
    }
  }
  return value;
}

const guard = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  if (request.method === "GET") {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        payments: true,
        items: {
          include: { product: true, variant: true },
        },
      },
    });
    if (!order) {
      return NextResponse.json({ message: "订单不存在" }, { status: 404 });
    }
    return NextResponse.json(order);
  }
  if (request.method === "PUT") {
    const payload = orderUpdateSchema.parse(await request.json());
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: payload.status,
        metadata: payload.metadata ? parseMetadata(payload.metadata) : undefined,
      },
      include: {
        user: true,
        payments: true,
        items: {
          include: { product: true, variant: true },
        },
      },
    });
    return NextResponse.json(order);
  }
  return NextResponse.json({ message: "不支持的请求" }, { status: 405 });
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const PUT = (request: Request, context: { params: { id: string } }) => guard(request, context);
