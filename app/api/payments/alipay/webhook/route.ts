import { NextResponse } from "next/server";
import { PaymentStatus, OrderStatus } from "@prisma/client";

import { getPaymentProvider } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { clearCartItems } from "@/lib/cart/server";

export async function POST(request: Request) {
  const provider = getPaymentProvider("alipay");
  const rawBody = await request.text();
  const result = await provider.handleWebhook({ rawBody, headers: request.headers });

  if (!result.ok || !result.reference) {
    return NextResponse.json(
      { success: false, message: result.message ?? "签名校验失败" },
      { status: 400 }
    );
  }

  const payment = await prisma.payment.findFirst({
    where: { intentId: result.reference, provider: provider.name },
  });

  if (!payment) {
    return NextResponse.json({ success: false, message: "支付记录不存在" }, { status: 404 });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: result.status ?? PaymentStatus.PROCESSING,
      transactionId: result.transactionId ?? payment.transactionId,
      rawPayload: result.rawData ?? payment.rawPayload,
    },
  });

  if (result.status === PaymentStatus.SUCCEEDED) {
    const order = await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PAID },
      include: { cart: true },
    });
    if (order.cartId) {
      await clearCartItems(order.cartId);
    }
  }

  return NextResponse.json({ success: true });
}
