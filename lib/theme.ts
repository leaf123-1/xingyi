// 全局主题 Token，便于统一调整品牌视觉风格。
export const themeTokens = {
  colors: {
    /** 主色用于按钮、激活态下划线等强调元素 */
    primary: "#1a4d8f",
    /** 次要强调色用于徽章或提示性标签 */
    accent: "#f97316",
    /** 顶部导航背景色，可统一切换为深色主题 */
    surface: "#ffffff",
  },
  radii: {
    /** 页面内常规圆角，影响 Mega Menu 容器、按钮等 */
    md: "0.75rem",
  },
  shadows: {
    /** 默认阴影用于未吸顶状态的导航条 */
    soft: "0 12px 40px rgba(15, 23, 42, 0.06)",
    /** 吸顶/滚动压缩后的增强阴影层次 */
    sticky: "0 12px 48px rgba(15, 23, 42, 0.12)",
  },
};

export type ThemeTokens = typeof themeTokens;
