"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Search, Menu, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  description: string;
  href: string;
  highlights: string[];
}

const megaMenu: Record<string, NavItem[]> = {
  "帐篷与庇护": [
    {
      title: "超轻帐篷",
      description: "为长距离徒步定制的碳杆结构",
      href: "/catalog?category=ultralight-tents",
      highlights: ["碳纤杆", "四季适用", "3000mm 防水"],
    },
    {
      title: "外挂天幕",
      description: "营地扩展、轻便易搭",
      href: "/catalog?category=tarps",
      highlights: ["快速搭建", "模块化拼接"],
    },
  ],
  "背负系统": [
    {
      title: "专业登山包",
      description: "多日重装设计，背负重心稳定",
      href: "/catalog?category=backpacks",
      highlights: ["碳纤背板", "模块兜袋"],
    },
    {
      title: "越野跑腰包",
      description: "竞速与补给随身携带",
      href: "/catalog?category=waistpack",
      highlights: ["多仓位", "透气网布"],
    },
  ],
};

const secondaryLinks = [
  { label: "装备顾问", href: "/content/gear-lab" },
  { label: "品牌故事", href: "/content/about" },
  { label: "可持续", href: "/content/sustainability" },
];

export function Header() {
  const pathname = usePathname();
  const [isSticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur transition-shadow",
        isSticky ? "shadow-md" : "shadow-none"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Xingyi Sports
          </Link>
          <div className="hidden items-center md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {Object.entries(megaMenu).map(([section, items]) => (
                  <NavigationMenuItem key={section}>
                    <NavigationMenuTrigger>{section}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[640px] grid-cols-2 gap-6 bg-card p-6">
                        {items.map((item) => (
                          <Link key={item.title} href={item.href} legacyBehavior passHref>
                            <NavigationMenuLink className="flex flex-col gap-2 rounded-lg border p-4 transition hover:border-primary/40 hover:bg-muted">
                              <div className="text-base font-semibold">
                                {item.title}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {item.highlights.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </NavigationMenuLink>
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          {secondaryLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm text-muted-foreground transition hover:text-foreground",
                pathname.startsWith(link.href) && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" aria-label="搜索">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="账户">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="后台">
            <ShieldCheck className="h-5 w-5" />
          </Button>
          <Button size="icon" aria-label="购物车">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <Button size="icon" variant="ghost" aria-label="打开购物车">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="打开菜单">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetTitle className="mb-4 text-base font-semibold">探索装备</SheetTitle>
        <nav className="space-y-6 text-sm">
          {Object.entries(megaMenu).map(([section, items]) => (
            <div key={section} className="space-y-3">
              <div className="font-semibold uppercase tracking-wide text-muted-foreground">
                {section}
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <Link key={item.title} href={item.href} className="flex flex-col gap-1">
                    <span className="text-base font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
              <Separator className="my-2" />
            </div>
          ))}
          <div className="space-y-2">
            {secondaryLinks.map((link) => (
              <Link key={link.label} href={link.href} className="block font-medium">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
