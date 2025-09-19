"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContactStatus } from "@prisma/client";

interface MessageItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  sourcePath?: string | null;
  status: ContactStatus;
  createdAt: string;
}

export function MessagesManager({ messages }: { messages: MessageItem[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: ContactStatus) {
    setUpdating(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("更新留言状态失败");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">客户留言</h1>
        <p className="text-sm text-muted-foreground">处理联络表单提交，合理分配客服优先级。</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="rounded-2xl border bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{message.name}</p>
                <p className="text-xs text-muted-foreground">
                  {message.email ?? message.phone ?? "未留联系方式"} · 来源：{message.sourcePath ?? "未记录"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                  value={message.status}
                  disabled={updating === message.id}
                  onChange={(event) => updateStatus(message.id, event.target.value as ContactStatus)}
                >
                  {Object.values(ContactStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{message.message}</p>
          </div>
        ))}
        {messages.length === 0 ? (
          <div className="rounded-2xl border bg-background p-6 text-center text-sm text-muted-foreground">
            暂无留言。
          </div>
        ) : null}
      </div>
    </section>
  );
}
