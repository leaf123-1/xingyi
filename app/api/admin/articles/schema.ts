import { PublishStatus } from "@prisma/client";
import { z } from "zod";

export const articleInputSchema = z.object({
  title: z.string().min(1, "标题必填"),
  slug: z.string().min(1, "Slug 必填"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "内容必填"),
  coverImage: z.string().optional(),
  status: z.nativeEnum(PublishStatus),
  publishedAt: z.string().optional().nullable(),
});
