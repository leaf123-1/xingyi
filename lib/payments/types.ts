import type { PaymentStatus } from "@prisma/client";

export type PaymentProviderName = "alipay" | "wechat" | "stripe";

export interface CreateCheckoutInput {
  /** 订单 ID，当来源于订单详情页时传入 */
  orderId?: string;
  /** 购物车 ID，用于未生成订单前的支付体验 */
  cartId?: string;
  /** 支付总金额（单位：货币最小单位，如 CNY 元） */
  amount: number;
  /** 货币代码，例如 CNY/ USD */
  currency: string;
  /** 支付完成后回跳地址 */
  returnUrl?: string;
  /** 附加上下文，实际接入时可传递用户/渠道信息 */
  metadata?: Record<string, unknown>;
}

export type CheckoutSession =
  | {
      flow: "redirect";
      /** 第三方支付跳转链接 */
      url: string;
      /** 支付宝 out_trade_no / 微信 out_trade_no 等外部引用号 */
      reference: string;
      /** session 失效时间（模拟值） */
      expiresAt?: string;
    }
  | {
      flow: "qr";
      /** 二维码字符串（可用于生成二维码图像） */
      qrCode: string;
      reference: string;
      expiresAt?: string;
    };

export interface HandleWebhookInput {
  rawBody: string;
  headers: Headers;
}

export interface WebhookVerificationResult {
  ok: boolean;
  /** 用于匹配 Payment.intentId */
  reference?: string;
  /** 第三方支付平台返回的交易号 */
  transactionId?: string;
  /** 对应订单 ID（若可从回调中解析） */
  orderId?: string;
  /** 支付状态，用于更新 Payment.status */
  status?: PaymentStatus;
  /** 原始报文，方便排查 */
  rawData?: unknown;
  /** 当校验失败时的提示信息 */
  message?: string;
}

export interface PaymentProvider {
  name: PaymentProviderName;
  /**
   * 创建支付会话。正式接入时需调用对应 SDK 的下单接口。
   * 这里使用模拟数据并保留 TODO 提示。
   */
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>;
  /**
   * 处理异步回调并返回校验结果。返回值由业务层更新 Payment/Order。
   */
  handleWebhook(input: HandleWebhookInput): Promise<WebhookVerificationResult>;
  /**
   * 查询支付结果，实际场景可调用第三方查询接口。
   */
  getStatus(reference: string): Promise<PaymentStatus>;
}
