import type { LucideIcon } from "lucide-react";

export interface NavMedia {
  /** 仅需改此处文案/链接：配置展示图像 */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface NavLeafItem {
  /** 仅需改此处文案/链接：导航项标题 */
  label: string;
  /** 仅需改此处文案/链接：跳转链接 */
  href: string;
  /** 仅需改此处文案/链接：可选描述 */
  description?: string;
  media?: NavMedia;
}

export interface NavColumn {
  /** 仅需改此处文案/链接：分组标题 */
  heading: string;
  items: NavLeafItem[];
}

export interface NavSection {
  /** 仅需改此处文案/链接：栏目名称 */
  title: string;
  columns: NavColumn[];
  featured?: NavLeafItem;
}

export interface NavItem {
  /** 仅需改此处文案/链接：一级导航标题 */
  label: string;
  href?: string;
  sections?: NavSection[];
}

export interface QuickAction {
  /** 仅需改此处文案/链接：动作名称 */
  label: string;
  /** 仅需改此处文案/链接：动作跳转 */
  href: string;
  icon: LucideIcon;
  ariaLabel: string;
}

export interface HeaderStrings {
  /** 仅需改此处文案/链接：顶部公告文案 */
  topBarMessage?: string;
  /** 仅需改此处文案/链接：搜索占位提示 */
  searchPlaceholder: string;
  /** 仅需改此处文案/链接：搜索输入 ARIA 标签 */
  searchAriaLabel: string;
  /** 仅需改此处文案/链接：跳转到内容的跳转链接文字 */
  skipToContent: string;
}

export const NAV_DATA: NavItem[] = [
  {
    label: "背负系统",
    sections: [
      {
        title: "超轻背包",
        columns: [
          {
            heading: "经典系列",
            items: [
              {
                label: "远征 Pro 55L",
                href: "/products/summit-ultra-pack",
                description: "超轻量碳纤维背架，适合 3-5 日长线徒步",
              },
              {
                label: "快速越野 35L",
                href: "/products/gale-trail-pack",
                description: "Trail Running 专用贴合背负系统",
              },
            ],
          },
          {
            heading: "配件",
            items: [
              {
                label: "腰包与肩袋",
                href: "/products?category=performance-packs&feature=pouches",
              },
              {
                label: "防水内胆",
                href: "/products?category=performance-packs&feature=drybag",
              },
            ],
          },
        ],
        featured: {
          label: "定制你的背包",
          href: "/products?category=performance-packs",
          description: "选择背负、颜色与配件，2 周内交付",
          media: {
            src: "/images/nav/custom-pack.jpg",
            alt: "定制背包渲染图",
            width: 360,
            height: 220,
          },
        },
      },
    ],
  },
  {
    label: "营地装备",
    sections: [
      {
        title: "帐篷与防护",
        columns: [
          {
            heading: "双人系列",
            items: [
              {
                label: "星轨 UL 2P",
                href: "/products/stardust-shelter",
                description: "双层复合材料，快速搭建",
              },
              {
                label: "云幕 1P",
                href: "/products/lumina-solo-tent",
              },
            ],
          },
          {
            heading: "庇护扩展",
            items: [
              {
                label: "碳纤天幕",
                href: "/products?category=light-tents&feature=canopy",
              },
              {
                label: "地席",
                href: "/products?category=light-tents&feature=footprint",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "服饰配件",
    href: "/products?category=training-gear",
  },
];

import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "账号",
    href: "/auth/sign-in",
    icon: UserRound,
    ariaLabel: "打开账户入口",
  },
  {
    label: "收藏",
    href: "/wishlist",
    icon: Heart,
    ariaLabel: "查看心愿单",
  },
  {
    label: "购物车",
    href: "/cart",
    icon: ShoppingBag,
    ariaLabel: "查看购物车",
  },
];

export const HEADER_STRINGS: HeaderStrings = {
  topBarMessage: "新品预售开启，会员尊享 9 折",
  searchPlaceholder: "搜索装备、分类或文章",
  searchAriaLabel: "站内搜索",
  skipToContent: "跳到主要内容",
};

export const SEARCH_ICON: QuickAction = {
  label: "搜索",
  href: "/search",
  icon: Search,
  ariaLabel: "打开站内搜索",
};
