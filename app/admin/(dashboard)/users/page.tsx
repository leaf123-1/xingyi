import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { UsersManager } from "@/components/admin/users-manager";

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    }),
    getCurrentUser(),
  ]);

  const formatted = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString().slice(0, 16),
  }));

  const canEditRoles = hasRole(currentUser, "ADMIN");

  return <UsersManager users={formatted} canEditRoles={canEditRoles} />;
}
