import { z } from "zod";

/**
 * 购物车条目在前端展示使用的结构，提供产品基础信息与金额。
 */
export interface CartItemDTO {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  compareAtPrice?: number | null;
  quantity: number;
  variantLabel?: string | null;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CartSnapshot {
  id: string;
  currency: string;
  items: CartItemDTO[];
  totals: CartTotals;
  totalQuantity: number;
}

export const addItemInputSchema = z.object({
  productId: z.string().min(1, "缺少商品 ID"),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().min(1, "数量至少为 1").max(99, "数量超出限制"),
});

export const updateItemInputSchema = z.object({
  itemId: z.string().min(1, "缺少条目 ID"),
  quantity: z.number().int().min(1, "数量至少为 1").max(99, "数量超出限制"),
});

export const removeItemInputSchema = z.object({
  itemId: z.string().min(1, "缺少条目 ID"),
});

export const mergeCartInputSchema = z.object({});

export const cartMutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("addItem"), data: addItemInputSchema }),
  z.object({ action: z.literal("updateQuantity"), data: updateItemInputSchema }),
  z.object({ action: z.literal("removeItem"), data: removeItemInputSchema }),
  z.object({ action: z.literal("merge"), data: mergeCartInputSchema.optional() }),
]);

export type AddItemInput = z.infer<typeof addItemInputSchema>;
export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;
export type RemoveItemInput = z.infer<typeof removeItemInputSchema>;
export type MergeCartInput = z.infer<typeof mergeCartInputSchema>;
export type CartMutationInput = z.infer<typeof cartMutationSchema>;
