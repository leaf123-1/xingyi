import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { userUpdateSchema } from "../schema";

const paramsSchema = z.object({ id: z.string().min(1) });

const guard = withRole("ADMIN", async (_ctx, request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  if (request.method === "GET") {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 });
    }
    return NextResponse.json(user);
  }
  if (request.method === "PUT") {
    const payload = userUpdateSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id },
      data: { role: payload.role },
    });
    return NextResponse.json(user);
  }
  return NextResponse.json({ message: "不支持的请求" }, { status: 405 });
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const PUT = (request: Request, context: { params: { id: string } }) => guard(request, context);
