import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers";

const PRICE_INITIAL = "1299.00";
const PRICE_UPDATED = "1349.00";
const PRICE_INITIAL_DISPLAY = `¥${PRICE_INITIAL.replace(/\.00$/, "")}`;
const PRICE_UPDATED_DISPLAY = `¥${PRICE_UPDATED.replace(/\.00$/, "")}`;

test.describe("后台商品 CRUD 冒烟", () => {
  test("创建-更新-删除商品", async ({ page }) => {
    await loginAsAdmin(page, "/admin/products");
    await expect(page.getByRole("heading", { name: "商品管理" })).toBeVisible();

    const unique = Date.now();
    const productName = `自动化测试商品 ${unique}`;
    const productSlug = `e2e-product-${unique}`;

    await test.step("创建商品", async () => {
      await page.getByRole("button", { name: "新建商品" }).click();

      const form = page.locator("form").filter({ hasText: "创建商品" });
      await form.locator("label:has-text(\"名称\") input").fill(productName);
      await form.locator("label:has-text(\"Slug\") input").fill(productSlug);
      await form.locator("label:has-text(\"商品描述\") textarea").fill("端到端测试创建的商品描述");
      await form.locator("label:has-text(\"规格 JSON\") textarea").fill('{"material":"碳纤维"}');
      await form.locator("label:has-text(\"基础售价\") input").fill(PRICE_INITIAL);
      await form.locator("label:has-text(\"状态\") select").selectOption("PUBLISHED");
      await form.locator("label:has-text(\"主图 URL\") input").fill("https://example.com/e2e-product.jpg");
      await form.locator("label:has-text(\"分类\") select").selectOption({ index: 1 });

      const createResponse = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/admin/products") && response.request().method() === "POST"
      );
      await form.getByRole("button", { name: "保存" }).click();
      await createResponse;

      const row = page.locator("tr", { hasText: productSlug });
      await expect(row).toBeVisible();
      await expect(row).toContainText(PRICE_INITIAL_DISPLAY);
    });

    await test.step("更新商品价格", async () => {
      const row = page.locator("tr", { hasText: productSlug });
      await row.getByRole("button", { name: "编辑" }).click();

      const form = page.locator("form").filter({ hasText: "编辑商品" });
      await form.locator("label:has-text(\"基础售价\") input").fill(PRICE_UPDATED);

      const updateResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/admin/products/") && response.request().method() === "PUT"
      );
      await form.getByRole("button", { name: "保存" }).click();
      await updateResponse;

      const updatedRow = page.locator("tr", { hasText: productSlug });
      await expect(updatedRow).toContainText(PRICE_UPDATED_DISPLAY);
    });

    await test.step("删除商品", async () => {
      const row = page.locator("tr", { hasText: productSlug });
      page.once("dialog", (dialog) => dialog.accept());

      const deleteResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/admin/products/") && response.request().method() === "DELETE"
      );
      await row.getByRole("button", { name: "删除" }).click();
      await deleteResponse;

      await expect(page.locator("tr", { hasText: productSlug })).toHaveCount(0);
    });
  });
});
