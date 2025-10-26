import { createHmac } from "crypto";
import type { Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "changeme";

// 登录后台的辅助方法，默认跳转至 /admin，便于复用在不同测试中。
export async function loginAsAdmin(page: Page, callbackUrl = "/admin") {
  await page.goto(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByPlaceholder("admin@example.com").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("••••••").fill(ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/admin/),
    page.getByRole("button", { name: "登录" }).click(),
  ]);
}

// 生成与模拟微信支付回调一致的签名，保持与服务端 mock 逻辑同步。
export function signWechatWebhook(payload: {
  id: string;
  out_trade_no: string;
  transaction_id: string;
  trade_state: string;
}): string {
  const secret = process.env.WECHAT_API_KEY ?? "demo-secret";
  const signaturePayload = JSON.stringify({
    id: payload.id,
    out_trade_no: payload.out_trade_no,
    transaction_id: payload.transaction_id,
    trade_state: payload.trade_state,
  });
  return createHmac("sha256", secret).update(signaturePayload).digest("hex");
}
