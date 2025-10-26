"use client";

import { useMemo, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { ProductStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/admin/media-uploader";

interface VariantForm {
  id?: string;
  sku: string;
  priceDelta: string;
  stock: number;
  attrs: string;
  barcode?: string;
}

export interface ProductFormState {
  id?: string;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  specs: string;
  coverImage: string;
  gallery: string[];
  price: string;
  compareAtPrice?: string;
  status: ProductStatus;
  categoryId?: string | null;
  variants: VariantForm[];
}

interface ProductManagerProps {
  products: ProductFormState[];
  categories: { id: string; name: string }[];
}

/**
 * 商品管理组件：支持创建、编辑与删除商品，含图集上传与变体维护。
 */
export function ProductManager({ products, categories }: ProductManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProductFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setEditing(null);
    setError(null);
  }

  function handleCreate() {
    setEditing({
      name: "",
      slug: "",
      subtitle: "",
      description: "",
      specs: "{}",
      coverImage: "",
      gallery: [],
      price: "0",
      compareAtPrice: "",
      status: ProductStatus.DRAFT,
      categoryId: null,
      variants: [],
    });
  }

  function handleEdit(product: ProductFormState) {
    setEditing({
      ...product,
      specs: product.specs || "{}",
      compareAtPrice: product.compareAtPrice ?? "",
      variants: product.variants?.map((variant) => ({
        ...variant,
        attrs: variant.attrs || "{}",
      })),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        subtitle: editing.subtitle,
        description: editing.description,
        specs: editing.specs,
        coverImage: editing.coverImage,
        gallery: editing.gallery,
        price: editing.price,
        compareAtPrice: editing.compareAtPrice || undefined,
        status: editing.status,
        categoryId: editing.categoryId || null,
        variants: editing.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          attrs: variant.attrs,
          priceDelta: variant.priceDelta,
          stock: Number(variant.stock ?? 0),
          barcode: variant.barcode || undefined,
        })),
      };
      const url = editing.id ? `/api/admin/products/${editing.id}` : "/api/admin/products";
      const method = editing.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }
      resetForm();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("保存失败，请检查必填项或控制台错误日志");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除该商品？")) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("删除失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  function updateVariant(index: number, patch: Partial<VariantForm>) {
    if (!editing) return;
    setEditing({
      ...editing,
      variants: editing.variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    });
  }

  function addVariant() {
    if (!editing) return;
    setEditing({
      ...editing,
      variants: [
        ...editing.variants,
        { sku: "", priceDelta: "0", stock: 0, attrs: "{}" },
      ],
    });
  }

  function removeVariant(index: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      variants: editing.variants.filter((_, i) => i !== index),
    });
  }

  const list = useMemo(() => products, [products]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商品管理</h1>
          <p className="text-sm text-muted-foreground">维护商品信息、图集与变体库存。</p>
        </div>
        <Button onClick={handleCreate} disabled={submitting}>
          新建商品
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="overflow-hidden rounded-2xl border bg-background">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">价格</th>
              <th className="px-4 py-3 text-left font-medium">分类</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((product) => (
              <tr key={product.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{product.status}</span>
                </td>
                <td className="px-4 py-3">¥{product.price}</td>
                <td className="px-4 py-3">{categories.find((item) => item.id === product.categoryId)?.name ?? "未分组"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id!)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  暂无商品，可点击右上角“新建商品”按钮开始配置。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing.id ? "编辑商品" : "创建商品"}</h2>
            <Button type="button" variant="ghost" onClick={resetForm}>
              取消
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>名称 *</span>
              <Input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
            </label>
            <label className="space-y-1 text-sm">
              <span>Slug *</span>
              <Input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value })} required />
            </label>
            <label className="space-y-1 text-sm">
              <span>副标题</span>
              <Input value={editing.subtitle ?? ""} onChange={(event) => setEditing({ ...editing, subtitle: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm">
              <span>分类</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={editing.categoryId ?? ""}
                onChange={(event) => setEditing({ ...editing, categoryId: event.target.value || null })}
              >
                <option value="">未设置</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>商品描述 *</span>
              <Textarea value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} required />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>规格 JSON</span>
              <Textarea
                value={editing.specs}
                onChange={(event) => setEditing({ ...editing, specs: event.target.value })}
                className="font-mono"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>基础售价 (¥) *</span>
              <Input
                type="number"
                step="0.01"
                value={editing.price}
                onChange={(event) => setEditing({ ...editing, price: event.target.value })}
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>对比价 (¥)</span>
              <Input
                type="number"
                step="0.01"
                value={editing.compareAtPrice ?? ""}
                onChange={(event) => setEditing({ ...editing, compareAtPrice: event.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>状态 *</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={editing.status}
                onChange={(event) => setEditing({ ...editing, status: event.target.value as ProductStatus })}
              >
                {Object.values(ProductStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>主图 URL *</span>
              <Input value={editing.coverImage} onChange={(event) => setEditing({ ...editing, coverImage: event.target.value })} required />
              <MediaUploader onUploaded={(url) => setEditing({ ...editing, coverImage: url })} />
            </label>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">图集</h3>
            <div className="flex flex-wrap gap-2">
              {editing.gallery.map((url, index) => (
                <Fragment key={url + index}>
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                    <span className="max-w-[160px] truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          gallery: editing.gallery.filter((_, i) => i !== index),
                        })
                      }
                    >
                      移除
                    </Button>
                  </div>
                </Fragment>
              ))}
              <MediaUploader
                onUploaded={(url) =>
                  setEditing({
                    ...editing,
                    gallery: [...editing.gallery, url],
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">商品变体</h3>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                新增变体
              </Button>
            </div>
            {editing.variants.length === 0 ? (
              <p className="text-xs text-muted-foreground">无变体时系统按单一 SKU 处理库存。</p>
            ) : null}
            <div className="space-y-4">
              {editing.variants.map((variant, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">变体 #{index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                      删除
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="space-y-1 text-sm">
                      <span>SKU *</span>
                      <Input
                        value={variant.sku}
                        onChange={(event) => updateVariant(index, { sku: event.target.value })}
                        required
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span>库存 *</span>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })}
                        required
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span>价格增减 (¥)</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.priceDelta}
                        onChange={(event) => updateVariant(index, { priceDelta: event.target.value })}
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span>条形码</span>
                      <Input
                        value={variant.barcode ?? ""}
                        onChange={(event) => updateVariant(index, { barcode: event.target.value })}
                      />
                    </label>
                    <label className="space-y-1 text-sm md:col-span-2">
                      <span>属性 JSON</span>
                      <Textarea
                        value={variant.attrs}
                        onChange={(event) => updateVariant(index, { attrs: event.target.value })}
                        className="font-mono"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
