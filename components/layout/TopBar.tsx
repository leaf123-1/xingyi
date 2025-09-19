"use client";

import { HEADER_STRINGS } from "@/config/nav";
import { themeTokens } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface TopBarProps {
  /** 自定义公告文案，默认读取 HEADER_STRINGS.topBarMessage */
  message?: string;
}

export function TopBar({ message }: TopBarProps) {
  const content = message ?? HEADER_STRINGS.topBarMessage;

  // 若未配置文案，则不渲染顶栏，保持视觉简洁。
  if (!content) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center border-b px-4 py-2 text-sm",
        "border-slate-200 bg-slate-900 text-white"
      )}
      style={{
        backgroundColor: themeTokens.colors.primary,
      }}
      role="status"
      aria-live="polite"
    >
      <p className="line-clamp-1 text-center font-medium tracking-wide">
        {content}
      </p>
    </div>
  );
}
