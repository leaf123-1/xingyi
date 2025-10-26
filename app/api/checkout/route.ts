import { NextResponse } from "next/server";
import { Prisma, PaymentStatus } from "@prisma/client";
import { z } from "zod";

import { getPaymentProvider, type PaymentProviderName } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createOrderFromCart } from "@/lib/cart/server";

const requestSchema = z
  .object({
    orderId: z.string().optional(),
    cartId: z.string().optional(),
    provider: z.enum(["alipay", "wechat", "stripe"]).optional(),
    returnUrl: z.string().url().optional(),
  })
  .refine((payload) => payload.orderId || payload.cartId, {
    message: "cartId 或 orderId 至少需要提供一个",
    path: ["cartId"],
  });

async function ensureOrder({
  orderId,
  cartId,
  userId,
}: {
  orderId?: string;
  cartId?: string;
  userId?: string | null;
}) {
  if (orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("订单不存在");
    }
    return order;
  }

  if (!cartId) {
    throw new Error("cartId 缺失");
  }

  return createOrderFromCart(cartId, userId);
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = requestSchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json({ error: "参数错误", details: result.error.flatten() }, { status: 400 });
  }

  try {
    const { orderId, cartId, provider: providerName, returnUrl } = result.data;
    const user = await getCurrentUser();
    const order = await ensureOrder({ orderId, cartId, userId: user?.id });
    const provider = getPaymentProvider(providerName as PaymentProviderName | undefined);

    const checkout = await provider.createCheckout({
      orderId: order.id,
      cartId,
      amount: new Prisma.Decimal(order.totalAmount).toNumber(),
      currency: order.currency,
      returnUrl,
      metadata: { orderId: order.id, cartId },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: provider.name,
        intentId: checkout.reference,
        amount: order.totalAmount,
        status: PaymentStatus.INIT,
        rawPayload: { checkout },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: payment.id,
      checkout,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建支付失败" },
      { status: 400 }
    );
  }
}
