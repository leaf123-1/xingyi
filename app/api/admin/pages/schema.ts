import { PublishStatus } from "@prisma/client";
import { z } from "zod";

export const pageInputSchema = z.object({
  title: z.string().min(1, "标题必填"),
  slug: z.string().min(1, "Slug 必填"),
  content: z.string().min(1, "内容必填"),
  status: z.nativeEnum(PublishStatus),
  publishedAt: z.string().optional().nullable(),
});
