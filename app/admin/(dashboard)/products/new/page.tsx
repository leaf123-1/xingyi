import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCreateForm } from "@/components/admin/product-create-form";

export const metadata: Metadata = {
  title: "新建商品 | 运营后台",
};

export default async function AdminProductCreatePage() {
  const categories = await prisma.category.findMany({
    orderBy: [
      { sort: "asc" },
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">新建商品（MinimalForm 示例）</h1>
        <p className="text-sm text-muted-foreground">
          使用统一的 MinimalForm 组件搭建后台商品创建流程，保持字段留白与交互一致。
        </p>
      </div>
      <ProductCreateForm categories={categories} />
    </div>
  );
}
