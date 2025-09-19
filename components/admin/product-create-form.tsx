"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductStatus } from "@prisma/client";
import { z } from "zod";
import { MinimalForm } from "@/components/forms/MinimalForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const inputBaseClass =
  "h-12 rounded-3xl border border-input bg-background px-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textareaBaseClass =
  "w-full rounded-3xl border border-input bg-background px-4 py-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const productCreateSchema = z.object({
  name: z.string().min(1, "请输入商品名称"),
  slug: z
    .string()
    .min(1, "请输入 URL Slug")
    .regex(/^[a-z0-9\-]+$/i, "Slug 仅支持字母、数字与短横线"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "请补充至少 10 个字的详情"),
  specs: z.string().optional(),
  coverImage: z.string().url("请输入有效的封面图片地址"),
  gallery: z.string().optional(),
  price: z
    .string()
    .min(1, "请输入售价")
    .refine((value) => !Number.isNaN(Number(value)), "请输入合法数字"),
  compareAtPrice: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Number(value)), "请输入合法数字"),
  status: z.nativeEnum(ProductStatus),
  categoryId: z.string().optional(),
});

type ProductCreateValues = z.infer<typeof productCreateSchema>;

const defaultValues: ProductCreateValues = {
  name: "",
  slug: "",
  subtitle: "",
  description: "",
  specs: "{\n  \"材质\": \"碳纤维\"\n}",
  coverImage: "",
  gallery: "",
  price: "0",
  compareAtPrice: "",
  status: ProductStatus.DRAFT,
  categoryId: "",
};

interface ProductCreateFormProps {
  categories: { id: string; name: string }[];
}

/**
 * ProductCreateForm：演示如何在后台使用 MinimalForm 快速构建商品创建体验。
 */
export function ProductCreateForm({ categories }: ProductCreateFormProps) {
  const router = useRouter();
  const categoryOptions = useMemo(() => categories, [categories]);

  return (
    <MinimalForm
      schema={productCreateSchema}
      defaultValues={defaultValues}
      submitLabel="创建商品"
      successMessage="商品创建成功，可继续补录或返回列表"
      resetOnSuccess
      footer={
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          返回商品列表
        </Button>
      }
      onSubmit={async (values) => {
        let specs: Record<string, unknown> | undefined;
        if (values.specs?.trim()) {
          try {
            specs = JSON.parse(values.specs);
          } catch (error) {
            throw new Error("规格需为合法 JSON 格式");
          }
        }

        const gallery = values.gallery
          ?.split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name.trim(),
            slug: values.slug.trim(),
            subtitle: values.subtitle?.trim() ? values.subtitle.trim() : undefined,
            description: values.description.trim(),
            specs: specs ?? undefined,
            coverImage: values.coverImage.trim(),
            gallery,
            price: values.price.trim(),
            compareAtPrice: values.compareAtPrice?.trim() ? values.compareAtPrice.trim() : undefined,
            status: values.status,
            categoryId: values.categoryId?.trim() ? values.categoryId.trim() : null,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? "创建失败，请检查必填项");
        }

        return { reset: true };
      }}
      fields={[
        {
          name: "name",
          label: "商品名称",
          required: true,
          description: "建议包含品类与卖点，便于快速识别。",
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              placeholder="例：超轻碳纤维登山杖"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "slug",
          label: "URL Slug",
          required: true,
          description: "仅支持英文字母、数字与 -，用于生成商品链接。",
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              placeholder="ultralight-trekking-poles"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "subtitle",
          label: "副标题",
          description: "可用于补充一句品牌宣言或卖点文案。",
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              placeholder="轻装徒步必备，兼顾稳定与韧性"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "price",
          label: "售价 (CNY)",
          required: true,
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              inputMode="decimal"
              placeholder="例如：1399"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "compareAtPrice",
          label: "划线价 (可选)",
          description: "用于展示折扣或原价，留空则不展示。",
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              inputMode="decimal"
              placeholder="例如：1599"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "status",
          label: "上架状态",
          required: true,
          render: ({ field, inputId }) => (
            <select
              id={inputId}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value as ProductStatus)}
              className={inputBaseClass}
            >
              {Object.values(ProductStatus).map((status) => (
                <option key={status} value={status}>
                  {status === ProductStatus.PUBLISHED ? "已发布" : "草稿"}
                </option>
              ))}
            </select>
          ),
        },
        {
          name: "categoryId",
          label: "所属分类",
          description: "可选：若未创建分类可先留空。",
          render: ({ field, inputId }) => (
            <select
              id={inputId}
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value)}
              className={inputBaseClass}
            >
              <option value="">未指定</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          ),
        },
        {
          name: "coverImage",
          label: "封面图 URL",
          required: true,
          description: (
            <span>
              支持 CDN 或 OSS 链接，若使用本地上传请先通过
              {" "}
              <Link href="/admin/products">商品列表</Link>
              {" "}
              上传并复制地址。
            </span>
          ),
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              placeholder="https://cdn.yoursite.com/products/cover.jpg"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "gallery",
          label: "图集 URL (换行分隔)",
          description: "每行一个链接，便于在详情页展示多图。",
          render: ({ field, inputId }) => (
            <Textarea
              {...field}
              id={inputId}
              rows={4}
              placeholder="https://cdn.yoursite.com/products/detail-1.jpg\nhttps://cdn.yoursite.com/products/detail-2.jpg"
              className={textareaBaseClass}
            />
          ),
        },
        {
          name: "description",
          label: "商品详情",
          required: true,
          description: "支持 Markdown 或富文本内容，当前示例使用纯文本。",
          render: ({ field, inputId }) => (
            <Textarea
              {...field}
              id={inputId}
              rows={5}
              placeholder="从材质、重量到适用场景的完整介绍"
              className={textareaBaseClass}
            />
          ),
        },
        {
          name: "specs",
          label: "规格 JSON",
          description: "示例：{\"重量\":\"480g\",\"展开长度\":\"135cm\"}",
          render: ({ field, inputId }) => (
            <Textarea
              {...field}
              id={inputId}
              rows={4}
              placeholder='{"重量":"480g","收纳长度":"62cm"}'
              className={textareaBaseClass}
            />
          ),
        },
      ]}
    />
  );
}
