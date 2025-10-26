# 支付抽象层本地调试说明

## 结算按钮调用示例
```tsx
// 仅示例：在组件内触发支付创建
const handleCheckout = async () => {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cartId: getCartIdFromCookie(),
      provider: "alipay",
      returnUrl: `${window.location.origin}/checkout/complete`,
    }),
  });
  const data = await response.json();
  if (data.checkout?.flow === "redirect") {
    window.location.href = data.checkout.url;
  }
};
```

## 回调联调建议
1. 在本地运行 `pnpm dev`，确保 `PAYMENT_PROVIDER` 已配置为 `alipay` 或 `wechat`。
2. 使用 [ngrok](https://ngrok.com/) 或其他内网穿透工具暴露本地 3000 端口，例如：
   ```bash
   ngrok http http://localhost:3000
   ```
3. 将生成的公网地址配置到 `.env` 中的 `ALIPAY_NOTIFY_URL` / `WECHAT_NOTIFY_URL`，并在第三方模拟平台或自定义脚本中，将回调请求发送到：
   - `https://<your-ngrok-domain>/api/payments/alipay/webhook`
   - `https://<your-ngrok-domain>/api/payments/wechat/webhook`
4. 使用 `curl` 构造示例回调：
   ```bash
   curl -X POST "https://<your-ngrok-domain>/api/payments/alipay/webhook" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     --data "out_trade_no=TEST123&trade_no=MOCK456&trade_status=TRADE_SUCCESS&sign=$(node scripts/mock-alipay-sign.js)"
   ```
   > ⚠️ 以上命令中的签名脚本需与项目中 `ALIPAY_WEBHOOK_SECRET` 保持一致。
5. 确认数据库中 `Payment.status` 更新为 `SUCCEEDED`，并检查 `Order.status` 是否同步为 `PAID`。

> 上线前请替换 `.env` 中的 `ALIPAY_*`、`WECHAT_*` 为真实商户信息与回调地址。
