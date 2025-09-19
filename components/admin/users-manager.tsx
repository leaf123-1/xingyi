"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";

interface UserItem {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface UsersManagerProps {
  users: UserItem[];
  canEditRoles: boolean;
}

export function UsersManager({ users, canEditRoles }: UsersManagerProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateRole(id: string, role: UserRole) {
    if (!canEditRoles) return;
    setUpdating(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("更新角色失败");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">用户与角色</h1>
        <p className="text-sm text-muted-foreground">查看团队成员，只有 ADMIN 可以调整权限。</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="overflow-hidden rounded-2xl border bg-background">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">姓名</th>
              <th className="px-4 py-3 text-left font-medium">邮箱</th>
              <th className="px-4 py-3 text-left font-medium">角色</th>
              <th className="px-4 py-3 text-left font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">{user.name ?? "未命名"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                    value={user.role}
                    disabled={!canEditRoles || updating === user.id}
                    onChange={(event) => updateRole(user.id, event.target.value as UserRole)}
                  >
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{user.createdAt}</td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  暂无用户。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
