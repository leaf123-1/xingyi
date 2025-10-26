import { Prisma, ProductStatus } from "@prisma/client";
import { z } from "zod";

export const variantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU 不能为空"),
  attrs: z.union([z.record(z.any()), z.string()]).optional(),
  priceDelta: z.union([z.string(), z.number()]).optional(),
  stock: z.number().int().nonnegative().default(0),
  barcode: z.string().optional(),
});

export const productInputSchema = z.object({
  name: z.string().min(1, "名称必填"),
  slug: z.string().min(1, "Slug 必填"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "描述必填"),
  specs: z.union([z.record(z.any()), z.string()]).optional(),
  coverImage: z.string().min(1, "主图必填"),
  gallery: z.array(z.string()).optional(),
  price: z.union([z.string(), z.number()]),
  compareAtPrice: z.union([z.string(), z.number()]).optional(),
  status: z.nativeEnum(ProductStatus),
  categoryId: z.string().optional().nullable(),
  variants: z.array(variantInputSchema).optional(),
});

export function parseDecimal(value: string | number | undefined | null) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const asString = typeof value === "number" ? value.toString() : value;
  return new Prisma.Decimal(asString);
}

export function parseJson(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("无法解析 JSON 字段", value, error);
      return null;
    }
  }
  return value ?? null;
}
