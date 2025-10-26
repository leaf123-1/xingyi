import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth/options";

export type AppSessionUser = NonNullable<Session["user"]> & { role: UserRole };
export type AppSession = Session & { user: AppSessionUser };

type RoleInput = UserRole | UserRole[];

type WithRoleHandler<TArgs extends unknown[], TResult> = (
  context: { session: AppSession },
  ...args: TArgs
) => TResult | Promise<TResult>;

// 自定义异常，便于调用方区分未登录与权限不足
export class AuthGuardError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AuthGuardError";
  }
}

// 获取当前会话信息
export async function getCurrentSession(): Promise<AppSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session as AppSession;
}

// 返回当前登录用户，方便在 Server Component 中直接使用
export async function getCurrentUser(): Promise<AppSessionUser | null> {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

// 判断用户是否具备指定角色
export function hasRole(user: { role?: UserRole } | null | undefined, required: RoleInput) {
  if (!user?.role) {
    return false;
  }
  const roles = Array.isArray(required) ? required : [required];
  return roles.includes(user.role);
}

// 提供服务端操作包裹器，校验角色后再执行
export function withRole<TArgs extends unknown[], TResult>(
  required: RoleInput,
  handler: WithRoleHandler<TArgs, TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    const session = await getCurrentSession();
    if (!session) {
      throw new AuthGuardError(401, "UNAUTHENTICATED");
    }
    if (!hasRole(session.user, required)) {
      throw new AuthGuardError(403, "FORBIDDEN");
    }
    return handler({ session }, ...args);
  };
}
