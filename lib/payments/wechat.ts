import crypto from "node:crypto";
import { PaymentStatus } from "@prisma/client";

import type {
  CheckoutSession,
  CreateCheckoutInput,
  HandleWebhookInput,
  PaymentProvider,
  WebhookVerificationResult,
} from "./types";

function createNonce(): string {
  return crypto.randomBytes(8).toString("hex");
}

function mockWechatSign(payload: string): string {
  const secret = process.env.WECHAT_API_KEY ?? "demo-secret";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export const wechatProvider: PaymentProvider = {
  name: "wechat",
  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const reference = input.orderId ?? input.cartId ?? `WX-${Date.now()}`;
    const codeUrl = `weixin://wxpay/bizpayurl?pr=${reference}&nonce=${createNonce()}`;

    // TODO: 接入微信支付 v3 JSAPI/Native 下单接口，生成真实的 prepay_id
    return {
      flow: "qr",
      qrCode: codeUrl,
      reference,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  },
  async handleWebhook(input: HandleWebhookInput): Promise<WebhookVerificationResult> {
    try {
      const data = JSON.parse(input.rawBody) as Record<string, unknown>;
      const signature = typeof data.signature === "string" ? data.signature : "";
      const payload = JSON.stringify({
        id: data.id,
        out_trade_no: data.out_trade_no,
        transaction_id: data.transaction_id,
        trade_state: data.trade_state,
      });

      const expected = mockWechatSign(payload);
      if (!signature || signature !== expected) {
        return { ok: false, message: "签名校验失败", rawData: data };
      }

      let status: PaymentStatus = PaymentStatus.PROCESSING;
      if (data.trade_state === "SUCCESS") {
        status = PaymentStatus.SUCCEEDED;
      } else if (data.trade_state === "CLOSED" || data.trade_state === "PAY_ERROR") {
        status = PaymentStatus.FAILED;
      }

      return {
        ok: true,
        reference: typeof data.out_trade_no === "string" ? data.out_trade_no : undefined,
        transactionId: typeof data.transaction_id === "string" ? data.transaction_id : undefined,
        orderId: typeof data.attach === "string" ? data.attach : undefined,
        status,
        rawData: data,
      };
    } catch (error) {
      return { ok: false, message: "回调解析失败", rawData: input.rawBody };
    }
  },
  async getStatus(): Promise<PaymentStatus> {
    // TODO: 接入微信支付 v3 查询订单接口
    return PaymentStatus.PROCESSING;
  },
};
