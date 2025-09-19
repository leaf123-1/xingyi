import { PaymentStatus } from "@prisma/client";

import { alipayProvider } from "./alipay";
import { wechatProvider } from "./wechat";
import type { PaymentProvider, PaymentProviderName } from "./types";

const stripeProvider: PaymentProvider = {
  name: "stripe",
  async createCheckout() {
    throw new Error("Stripe provider 尚未接入，请切换 PAYMENT_PROVIDER 配置");
  },
  async handleWebhook() {
    return { ok: false, message: "Stripe provider 未启用" };
  },
  async getStatus() {
    return PaymentStatus.PROCESSING;
  },
};

const providers: Record<PaymentProviderName, PaymentProvider> = {
  alipay: alipayProvider,
  wechat: wechatProvider,
  stripe: stripeProvider,
};

export function getPaymentProvider(name?: PaymentProviderName): PaymentProvider {
  const fallback = (process.env.PAYMENT_PROVIDER as PaymentProviderName | undefined) ?? "alipay";
  const providerName = name ?? fallback;
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unsupported payment provider: ${providerName}`);
  }
  return provider;
}

export * from "./types";
