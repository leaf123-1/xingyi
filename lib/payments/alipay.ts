import crypto from "node:crypto";
import { PaymentStatus } from "@prisma/client";

import type {
  CheckoutSession,
  CreateCheckoutInput,
  HandleWebhookInput,
  PaymentProvider,
  WebhookVerificationResult,
} from "./types";

const ALIPAY_GATEWAY = "https://openapi.alipay.com/gateway.do";

function mockSign(payload: string): string {
  const secret = process.env.ALIPAY_PRIVATE_KEY ?? "demo-secret";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function verifyMockSignature(payload: string, signature: string): boolean {
  const secret = process.env.ALIPAY_WEBHOOK_SECRET ?? process.env.ALIPAY_PRIVATE_KEY ?? "demo-secret";
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (provided.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(provided, expectedBuffer);
}

export const alipayProvider: PaymentProvider = {
  name: "alipay",
  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const reference = input.orderId ?? input.cartId ?? `ALI-${Date.now()}`;
    const notifyUrl = process.env.ALIPAY_NOTIFY_URL ?? "http://localhost:3000/api/payments/alipay/webhook";
    const returnUrl = input.returnUrl ?? process.env.ALIPAY_RETURN_URL ?? "http://localhost:3000/checkout/success";

    const params = new URLSearchParams({
      app_id: process.env.ALIPAY_APP_ID ?? "demo-app-id",
      method: "alipay.trade.page.pay",
      format: "JSON",
      charset: "utf-8",
      sign_type: "HMAC-SHA256",
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      version: "1.0",
      notify_url: notifyUrl,
      return_url: returnUrl,
      biz_content: JSON.stringify({
        out_trade_no: reference,
        product_code: "FAST_INSTANT_TRADE_PAY",
        total_amount: input.amount.toFixed(2),
        subject: `Order ${reference}`,
        passback_params: input.metadata ? Buffer.from(JSON.stringify(input.metadata)).toString("base64") : undefined,
      }),
    });

    const sign = mockSign(params.toString());
    params.set("sign", sign);

    // TODO: 接入正式 SDK 时调用 alipay-sdk-nodejs 并使用公私钥签名
    return {
      flow: "redirect",
      url: `${ALIPAY_GATEWAY}?${params.toString()}`,
      reference,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  },
  async handleWebhook(input: HandleWebhookInput): Promise<WebhookVerificationResult> {
    const payload = new URLSearchParams(input.rawBody);
    const sign = payload.get("sign") ?? "";
    payload.delete("sign");

    if (!sign || !verifyMockSignature(payload.toString(), sign)) {
      return { ok: false, message: "签名校验失败", rawData: Object.fromEntries(payload.entries()) };
    }

    const tradeStatus = payload.get("trade_status") ?? "";
    let status: PaymentStatus = PaymentStatus.PROCESSING;
    if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
      status = PaymentStatus.SUCCEEDED;
    } else if (tradeStatus === "TRADE_CLOSED") {
      status = PaymentStatus.FAILED;
    }

    let orderId: string | undefined;
    const passback = payload.get("passback_params");
    if (passback) {
      try {
        const decoded = JSON.parse(Buffer.from(passback, "base64").toString());
        orderId = typeof decoded.orderId === "string" ? decoded.orderId : undefined;
      } catch (error) {
        // 忽略解析错误，仅记录原始报文
        console.warn("Failed to parse alipay passback params", error);
      }
    }

    return {
      ok: true,
      reference: payload.get("out_trade_no") ?? undefined,
      transactionId: payload.get("trade_no") ?? undefined,
      orderId,
      status,
      rawData: Object.fromEntries(payload.entries()),
    };
  },
  async getStatus(): Promise<PaymentStatus> {
    // TODO: 接入 alipay.trade.query 查询真实支付状态
    return PaymentStatus.PROCESSING;
  },
};
