import { expect, test } from "@playwright/test";

import { loginAsAdmin, signWechatWebhook } from "./helpers";

test.describe("店铺关键路径", () => {
  test("浏览筛选加购并完成支付回调", async ({ page }) => {
    await test.step("浏览首页并进入商品列表", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "启动下一次长距离冒险的核心装备集" })).toBeVisible();
      await Promise.all([
        page.waitForURL(/\/products/),
        page.getByRole("link", { name: "浏览全部商品" }).click(),
      ]);
    });

    let productName = "";
    await test.step("筛选分类并打开商品详情", async () => {
      const categoryButton = page.getByRole("button", { name: "轻量帐篷" });
      await Promise.all([
        page.waitForURL(/category=light-tents/),
        categoryButton.click(),
      ]);
      const firstCard = page.locator("article").first();
      productName = (await firstCard.locator("h3").textContent())?.trim() ?? "";
      await firstCard.getByRole("link", { name: "查看详情" }).click();
      await expect(page).toHaveURL(/\/products\//);
      if (productName) {
        await expect(page.getByRole("heading", { level: 1, name: productName })).toBeVisible();
      }
    });

    let orderId = "";
    let paymentReference = "";
    await test.step("加入购物车并提交结算表单", async () => {
      await page.getByRole("button", { name: "加入购物车" }).first().click();
      await expect(page.getByText("已加入购物车")).toBeVisible();

      await page.goto("/cart");
      await expect(page.getByRole("heading", { name: "确认即将结算的商品" })).toBeVisible();
      if (productName) {
        await expect(page.getByRole("link", { name: productName })).toBeVisible();
      }

      await page.getByRole("link", { name: "前往结算" }).click();
      await expect(page).toHaveURL(/\/checkout$/);

      await page.getByPlaceholder("姓名").fill("端到端顾客");
      await page.getByPlaceholder("example@domain.com").fill("e2e@example.com");
      await page.getByPlaceholder("手机号").fill("13800138000");
      await page.getByPlaceholder("省市区 + 详细街道门牌").fill("上海市黄浦区测试路 123 号");

      await page.locator("label", { hasText: "微信支付" }).click();

      const checkoutResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/checkout") && response.request().method() === "POST"
      );
      await page.getByRole("button", { name: "确认订单并支付" }).click();
      const checkoutResponse = await checkoutResponsePromise;
      const checkoutData = await checkoutResponse.json();

      expect(checkoutData?.success).toBeTruthy();
      orderId = checkoutData.orderId as string;
      paymentReference = checkoutData.checkout.reference as string;
      expect(checkoutData.checkout.flow).toBe("qr");

      await expect(page.getByText("请使用微信扫描二维码完成支付。")).toBeVisible();
    });

    await test.step("模拟微信支付回调并确认订单状态", async () => {
      const webhookPayload = {
        id: `wx-notify-${Date.now()}`,
        out_trade_no: paymentReference,
        transaction_id: `wx-transaction-${Date.now()}`,
        trade_state: "SUCCESS",
        attach: orderId,
      };
      const signature = signWechatWebhook(webhookPayload);
      const webhookResponse = await page.request.post("/api/payments/wechat/webhook", {
        data: { ...webhookPayload, signature },
      });
      expect(webhookResponse.ok()).toBeTruthy();

      await loginAsAdmin(page, "/admin/orders");
      await expect(page.getByRole("heading", { name: "订单管理" })).toBeVisible();

      const orderData = await page.evaluate(async (id: string) => {
        const response = await fetch(`/api/admin/orders/${id}`);
        if (!response.ok) {
          throw new Error(`无法获取订单 ${id}`);
        }
        return response.json();
      }, orderId);

      expect(orderData.status).toBe("PAID");
      expect(Array.isArray(orderData.payments)).toBe(true);
      expect(orderData.payments.some((payment: { status: string }) => payment.status === "SUCCEEDED")).toBe(true);
      await expect(page.locator("body")).toContainText(orderData.orderNumber);
    });
  });
});
