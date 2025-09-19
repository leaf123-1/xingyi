import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1, "分类名称必填"),
  slug: z.string().min(1, "Slug 必填"),
  sort: z.number().int().default(0),
  parentId: z.string().nullable().optional(),
});
