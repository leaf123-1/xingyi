import { NextResponse } from "next/server";

import {
  addItemToActiveCart,
  getActiveCart,
  mergeActiveCart,
  removeActiveCartItem,
  updateActiveCartItem,
} from "@/lib/cart/server";
import {
  cartMutationSchema,
  type CartMutationInput,
} from "@/lib/cart/types";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const cart = await getActiveCart();
    return NextResponse.json({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取购物车失败";
    return errorResponse(message, 500);
  }
}

async function handleMutation(input: CartMutationInput) {
  switch (input.action) {
    case "addItem":
      return addItemToActiveCart(input.data);
    case "updateQuantity":
      return updateActiveCartItem(input.data);
    case "removeItem":
      return removeActiveCartItem(input.data);
    case "merge":
      return mergeActiveCart();
    default:
      throw new Error("不支持的操作");
  }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  if (!json) {
    return errorResponse("请求体必须为 JSON", 400);
  }

  const parsed = cartMutationSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse("参数校验失败", 422);
  }

  try {
    const cart = await handleMutation(parsed.data);
    return NextResponse.json({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "购物车更新失败";
    const status = message === "仅登录用户可触发购物车合并" ? 401 : 400;
    return errorResponse(message, status);
  }
}
