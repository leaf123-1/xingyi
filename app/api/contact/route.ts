import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z
  .object({
    name: z.string().min(2, "请输入姓名"),
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{6,}$/u, "请输入有效电话")
      .optional(),
    message: z.string().min(10, "请描述需求"),
    consent: z.literal(true),
    sourcePath: z.string().optional(),
  })
  .refine((value) => value.email || value.phone, {
    message: "需要至少提供邮箱或电话", // 保证客服可回访
    path: ["email"],
  });

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 分钟
const RATE_LIMIT_MAX = 5;

export async function POST(request: Request) {
  const identifier = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous";
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (entry && entry.resetAt > now) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "提交过于频繁，请稍后再试" }, { status: 429 });
    }
    entry.count += 1;
  } else {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "提交数据有误，请检查表单内容" }, { status: 400 });
  }

  const { name, email, phone, message, sourcePath } = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone,
      message,
      sourcePath,
    },
  });

  return NextResponse.json({ success: true });
}
