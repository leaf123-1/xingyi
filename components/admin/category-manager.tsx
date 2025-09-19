"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryFormState {
  id?: string;
  name: string;
  slug: string;
  sort: number;
  parentId?: string | null;
}

interface CategoryManagerProps {
  categories: CategoryFormState[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setEditing(null);
    setError(null);
  }

  function handleCreate() {
    setEditing({ name: "", slug: "", sort: 0, parentId: null });
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
        sort: Number(editing.sort ?? 0),
        parentId: editing.parentId || null,
      };
      const url = editing.id ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const method = editing.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      reset();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("保存分类失败，请检查输入");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("删除分类会同步移除关联的子分类，确认继续？")) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("删除失败，分类可能仍有关联商品");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">分类管理</h1>
          <p className="text-sm text-muted-foreground">支持树形分类与排序，前台导航可直接使用。</p>
        </div>
        <Button onClick={handleCreate} disabled={submitting}>
          新建分类
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="overflow-hidden rounded-2xl border bg-background">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">排序</th>
              <th className="px-4 py-3 text-left font-medium">父分类</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3">{category.sort}</td>
                <td className="px-4 py-3">
                  {category.parentId
                    ? categories.find((item) => item.id === category.parentId)?.name ?? "-"
                    : "一级分类"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(category)}>
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id!)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  暂无分类，可点击右上角“新建分类”。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing.id ? "编辑分类" : "创建分类"}</h2>
            <Button type="button" variant="ghost" onClick={reset}>
              取消
            </Button>
          </div>
          <label className="space-y-1 text-sm">
            <span>名称 *</span>
            <Input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
          </label>
          <label className="space-y-1 text-sm">
            <span>Slug *</span>
            <Input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value })} required />
          </label>
          <label className="space-y-1 text-sm">
            <span>排序</span>
            <Input
              type="number"
              value={editing.sort}
              onChange={(event) => setEditing({ ...editing, sort: Number(event.target.value) })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>父分类</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={editing.parentId ?? ""}
              onChange={(event) => setEditing({ ...editing, parentId: event.target.value || null })}
            >
              <option value="">一级分类</option>
              {categories
                .filter((category) => category.id !== editing.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
