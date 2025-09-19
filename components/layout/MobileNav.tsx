"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";

import { NAV_DATA, QUICK_ACTIONS, SEARCH_ICON, HEADER_STRINGS } from "@/config/nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  /** 点击跳转后关闭抽屉 */
  onNavigate?: () => void;
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleNavigate = () => {
    onNavigate?.();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        aria-label="打开主导航"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </SheetTrigger>
      <SheetContent className="w-full max-w-sm overflow-y-auto bg-white">
        <div className="space-y-6 pt-10">
          <form action={SEARCH_ICON.href} className="px-1">
            <label htmlFor="mobile-search" className="sr-only">
              {HEADER_STRINGS.searchAriaLabel}
            </label>
            <input
              id="mobile-search"
              name="q"
              type="search"
              placeholder={HEADER_STRINGS.searchPlaceholder}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </form>

          <nav aria-label="移动端主导航" className="space-y-2">
            {NAV_DATA.map((item) => {
              const hasSection = item.sections && item.sections.length > 0;
              const isExpanded = expanded === item.label;

              return (
                <div key={item.label} className="border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between">
                    {hasSection ? (
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-between rounded-md px-2 py-3 text-left text-base font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        onClick={() =>
                          setExpanded((prev) => (prev === item.label ? null : item.label))
                        }
                        aria-expanded={isExpanded}
                        aria-controls={`mobile-nav-panel-${item.label}`}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 transition-transform",
                            isExpanded ? "rotate-180" : "rotate-0"
                          )}
                          aria-hidden
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href ?? "#"}
                        prefetch={Boolean(item.href)}
                        className="flex flex-1 items-center rounded-md px-2 py-3 text-base font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        onClick={handleNavigate}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>

                  {hasSection && (
                    <div
                      id={`mobile-nav-panel-${item.label}`}
                      hidden={!isExpanded}
                      className="mt-1 space-y-4 rounded-lg bg-slate-50 p-3"
                    >
                      {item.sections?.map((section) => (
                        <div key={section.title} className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {section.title}
                          </p>
                          {section.columns.map((column) => (
                            <div key={column.heading} className="space-y-1">
                              <p className="text-sm font-semibold text-slate-700">
                                {column.heading}
                              </p>
                              <ul className="space-y-1">
                                {column.items.map((leaf) => (
                                  <li key={leaf.href}>
                                    <Link
                                      href={leaf.href}
                                      prefetch
                                      className="block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                      onClick={handleNavigate}
                                    >
                                      <span className="block font-medium">{leaf.label}</span>
                                      {leaf.description ? (
                                        <span className="block text-xs text-slate-500">
                                          {leaf.description}
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {section.featured ? (
                            <Link
                              href={section.featured.href}
                              prefetch
                              className="flex items-center gap-3 rounded-md bg-white p-3 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                              onClick={handleNavigate}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                  {section.featured.label}
                                </p>
                                {section.featured.description ? (
                                  <p className="text-xs text-slate-500">
                                    {section.featured.description}
                                  </p>
                                ) : null}
                              </div>
                            </Link>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                prefetch
                className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                onClick={handleNavigate}
              >
                <action.icon className="h-5 w-5" aria-hidden />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
