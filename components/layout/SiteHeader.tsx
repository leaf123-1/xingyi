"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  NAV_DATA,
  QUICK_ACTIONS,
  SEARCH_ICON,
  HEADER_STRINGS,
  type NavSection,
  type NavLeafItem,
} from "@/config/nav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { themeTokens } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

const SCROLL_THRESHOLD = 32;

export function SiteHeader() {
  const [isCompact, setIsCompact] = useState(false);
  const { cart } = useCart();
  const cartCount = cart?.totalQuantity ?? 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 提供跳转到主内容的可访问链接 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900"
      >
        {HEADER_STRINGS.skipToContent}
      </a>

      <TopBar />

      <div
        className={cn(
          "w-full border-b border-slate-200 transition-[box-shadow,height,padding] duration-300",
          "bg-white/95 backdrop-blur",
          isCompact ? "py-2" : "py-4"
        )}
        style={{
          backgroundColor: themeTokens.colors.surface,
          boxShadow: isCompact ? themeTokens.shadows.sticky : themeTokens.shadows.soft,
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4">
          <div className="flex flex-1 items-center gap-6">
            <Link
              href="/"
              prefetch
              className="flex items-center gap-3 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="前往首页"
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                role="img"
                aria-hidden
                className="text-slate-900"
              >
                <rect x="2" y="2" width="32" height="32" rx="8" fill={themeTokens.colors.primary} />
                <path
                  d="M11 24L18 10L25 24H21.9L18 16.6L14.1 24H11Z"
                  fill="white"
                />
              </svg>
              <span className="text-lg font-semibold tracking-wide text-slate-900">Xingyi Sports</span>
            </Link>

            <NavigationMenu className="hidden flex-1 lg:flex">
              <NavigationMenuList className="gap-3">
                {NAV_DATA.map((item) => {
                  const hasMega = item.sections && item.sections.length > 0;
                  return (
                    <NavigationMenuItem key={item.label}>
                      {hasMega ? (
                        <NavigationMenuTrigger
                          className={cn(
                            "rounded-full px-4 py-2 text-sm font-medium text-slate-700",
                            "transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400",
                            "data-[state=open]:text-slate-900"
                          )}
                        >
                          {item.label}
                        </NavigationMenuTrigger>
                      ) : (
                        <NavigationMenuLink
                          asChild
                          className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <Link href={item.href ?? "#"} prefetch={Boolean(item.href)}>
                            {item.label}
                          </Link>
                        </NavigationMenuLink>
                      )}
                      {hasMega ? (
                        <NavigationMenuContent className="mt-4">
                          <div
                            className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
                            style={{
                              borderRadius: themeTokens.radii.md,
                            }}
                          >
                            {item.sections?.map((section) => (
                              <MegaSection key={section.title} section={section} />
                            ))}
                          </div>
                        </NavigationMenuContent>
                      ) : null}
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
              <NavigationMenuIndicator />
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-3">
            <form
              action={SEARCH_ICON.href}
              className="relative hidden items-center rounded-full border border-slate-200 bg-white px-4 py-2 transition focus-within:border-slate-400 focus-within:shadow-sm lg:flex"
            >
              <label htmlFor="desktop-search" className="sr-only">
                {HEADER_STRINGS.searchAriaLabel}
              </label>
              <SEARCH_ICON.icon className="mr-2 h-5 w-5 text-slate-500" aria-hidden />
              <input
                id="desktop-search"
                type="search"
                name="q"
                placeholder={HEADER_STRINGS.searchPlaceholder}
                className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </form>

            <nav aria-label="快捷操作" className="hidden items-center gap-2 lg:flex">
              {QUICK_ACTIONS.map((action) => {
                const isCart = action.href === "/cart";
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    prefetch
                    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    aria-label={action.ariaLabel}
                  >
                    <action.icon className="h-5 w-5 group-hover:scale-110" aria-hidden />
                    {isCart && cartCount > 0 ? (
                      <span className="absolute -right-1 -top-1 min-h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                        {cartCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 lg:hidden">
              <form action={SEARCH_ICON.href}>
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  aria-label={SEARCH_ICON.ariaLabel}
                >
                  <SEARCH_ICON.icon className="h-5 w-5" aria-hidden />
                </button>
              </form>
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MegaSection({ section }: { section: NavSection }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="grid gap-6 sm:grid-cols-2">
        {section.columns.map((column) => (
          <div key={column.heading} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {column.heading}
            </p>
            <ul className="space-y-2">
              {column.items.map((item) => (
                <li key={item.href}>
                  <MegaMenuLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {section.featured ? (
        <Link
          href={section.featured.href}
          prefetch
          className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-md transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          style={{
            borderRadius: themeTokens.radii.md,
          }}
        >
          {section.featured.media ? (
            <Image
              src={section.featured.media.src}
              alt={section.featured.media.alt}
              width={section.featured.media.width}
              height={section.featured.media.height}
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-80"
              loading="lazy"
            />
          ) : null}
          <div className="relative space-y-1 p-5">
            <p className="text-sm font-semibold">{section.featured.label}</p>
            {section.featured.description ? (
              <p className="text-xs text-slate-200">{section.featured.description}</p>
            ) : null}
          </div>
        </Link>
      ) : null}
    </div>
  );
}

function MegaMenuLink({ item }: { item: NavLeafItem }) {
  return (
    <Link
      href={item.href}
      prefetch
      className="group flex items-start gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      {item.media ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
          <Image
            src={item.media.src}
            alt={item.media.alt}
            width={item.media.width}
            height={item.media.height}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
          {item.label}
        </p>
        {item.description ? (
          <p className="text-xs text-slate-500">{item.description}</p>
        ) : null}
      </div>
    </Link>
  );
}
