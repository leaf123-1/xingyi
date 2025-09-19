"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AdminSidebarNavProps {
  items: AdminNavItem[];
  onNavigate?: () => void;
}

export function AdminSidebarNav({ items, onNavigate }: AdminSidebarNavProps) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 text-sm">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
              active ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ items }: { items: AdminNavItem[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">打开后台导航</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">后台导航</h2>
          <p className="text-xs text-muted-foreground">快捷切换模块</p>
        </div>
        <AdminSidebarNav items={items} />
      </SheetContent>
    </Sheet>
  );
}
