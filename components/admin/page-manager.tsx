"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PageFormState {
  id?: string;
  title: string;
  slug: string;
  content: string;
  status: PublishStatus;
  publishedAt?: string | null;
}

interface PageManagerProps {
  pages: PageFormState[];
}

export function PageManager({ pages }: PageManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<PageFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setEditing(null);
    setError(null);
  }

  function handleCreate() {
    setEditing({ title: "", slug: "", content: "", status: PublishStatus.DRAFT, publishedAt: null });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: editing.title,
        slug: editing.slug,
        content: editing.content,
        status: editing.status,
        publishedAt: editing.publishedAt || undefined,
      };
      const url = editing.id ? `/api/admin/pages/${editing.id}` : "/api/admin/pages";
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
      setError("保存页面失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除该页面？")) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("删除页面失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">页面管理</h1>
          <p className="text-sm text-muted-foreground">维护品牌故事、关于我们等静态内容。</p>
        </div>
        <Button onClick={handleCreate} disabled={submitting}>
          新建页面
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-4">
        {pages.map((page) => (
          <div key={page.id} className="rounded-2xl border bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{page.title}</p>
                <p className="text-xs text-muted-foreground">{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{page.status}</span>
                <Button variant="outline" size="sm" onClick={() => setEditing(page)}>
                  编辑
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id!)}>
                  删除
                </Button>
              </div>
            </div>
          </div>
        ))}
        {pages.length === 0 ? (
          <div className="rounded-2xl border bg-background p-6 text-center text-sm text-muted-foreground">
            暂无页面内容。
          </div>
        ) : null}
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing.id ? "编辑页面" : "创建页面"}</h2>
            <Button type="button" variant="ghost" onClick={reset}>
              取消
            </Button>
          </div>
          <label className="space-y-1 text-sm">
            <span>标题 *</span>
            <Input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required />
          </label>
          <label className="space-y-1 text-sm">
            <span>Slug *</span>
            <Input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value })} required />
          </label>
          <label className="space-y-1 text-sm">
            <span>内容 *</span>
            <Textarea
              value={editing.content}
              onChange={(event) => setEditing({ ...editing, content: event.target.value })}
              className="min-h-[240px]"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>状态 *</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={editing.status}
              onChange={(event) => setEditing({ ...editing, status: event.target.value as PublishStatus })}
            >
              {Object.values(PublishStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>发布时间 (可选)</span>
            <Input
              type="datetime-local"
              value={editing.publishedAt ?? ""}
              onChange={(event) => setEditing({ ...editing, publishedAt: event.target.value })}
            />
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
