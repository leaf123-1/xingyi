import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { messageUpdateSchema } from "../schema";

const paramsSchema = z.object({ id: z.string().min(1) });

const guard = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  if (request.method === "GET") {
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ message: "留言不存在" }, { status: 404 });
    }
    return NextResponse.json(message);
  }
  if (request.method === "PUT") {
    const payload = messageUpdateSchema.parse(await request.json());
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status: payload.status },
    });
    return NextResponse.json(message);
  }
  return NextResponse.json({ message: "不支持的请求" }, { status: 405 });
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const PUT = (request: Request, context: { params: { id: string } }) => guard(request, context);
