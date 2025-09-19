import { ReactNode } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Package,
  ShieldCheck,
  Tags,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AdminMobileNav, AdminNavItem, AdminSidebarNav } from "@/components/admin/sidebar";

const navItems: AdminNavItem[] = [
  { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { label: "商品", href: "/admin/products", icon: Package },
  { label: "分类", href: "/admin/categories", icon: Tags },
  { label: "订单", href: "/admin/orders", icon: ClipboardList },
  { label: "支付", href: "/admin/payments", icon: CreditCard },
  { label: "文章", href: "/admin/articles", icon: Newspaper },
  { label: "页面", href: "/admin/pages", icon: FileText },
  { label: "留言", href: "/admin/messages", icon: MessageCircle },
  { label: "用户与角色", href: "/admin/users", icon: ShieldCheck },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-72 flex-shrink-0 border-r bg-background/95 px-6 py-8 md:block">
        <div className="mb-8 space-y-1">
          <h1 className="text-xl font-semibold">运营后台</h1>
          <p className="text-xs text-muted-foreground">管理商品、订单、内容与团队权限</p>
        </div>
        <AdminSidebarNav items={navItems} />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <AdminMobileNav items={navItems} />
              <div>
                <p className="text-sm font-medium">欢迎回来，{user?.name ?? user?.email ?? "管理员"}</p>
                <p className="text-xs text-muted-foreground">权限：{user?.role ?? "UNKNOWN"}</p>
              </div>
            </div>
            <Link href="/" className="hidden md:inline-flex">
              <Button variant="outline" size="sm">
                返回前台
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
