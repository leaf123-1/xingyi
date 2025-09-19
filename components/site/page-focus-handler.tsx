"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 客户端路由切换后自动聚焦主内容区域，提升键盘与屏幕阅读器体验。
 */
export function PageFocusHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
