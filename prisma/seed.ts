/**
 * Prisma 数据填充脚本
 * 运行前请确保已执行 `pnpm db:push`
 */
import {
  PrismaClient,
  ProductStatus,
  PublishStatus,
  UserRole,
} from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始写入演示数据...");

  // 清理顺序需考虑外键约束
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.article.deleteMany();
  await prisma.page.deleteMany();
  await prisma.contactMessage.deleteMany();

  // 准备管理员用户，方便后台登录演示
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: UserRole.ADMIN },
    create: {
      email: "admin@example.com",
      name: "演示管理员",
      role: UserRole.ADMIN,
      passwordHash: await hashPassword("changeme"), // 演示用途，实际请替换为安全哈希
    },
  });

  // 商品分类示例
  const categoriesData = [
    { name: "专业背包", slug: "performance-packs", sort: 1 },
    { name: "轻量帐篷", slug: "light-tents", sort: 2 },
    { name: "训练配件", slug: "training-gear", sort: 3 },
  ];

  const categories = await Promise.all(
    categoriesData.map((data) =>
      prisma.category.create({
        data,
      })
    )
  );

  const categoryMap = new Map(categories.map((cat) => [cat.slug, cat]));

  type SeedVariant = {
    sku: string;
    attrs: Record<string, unknown>;
    priceDelta: string;
    stock: number;
  };

  type SeedProduct = {
    name: string;
    subtitle?: string;
    slug: string;
    description: string;
    specs: Record<string, unknown>;
    coverImage: string;
    gallery: string[];
    price: string;
    compareAtPrice?: string;
    categorySlug: string;
    variants: SeedVariant[];
  };

  // 商品数据（8 个，含 2 个带变体）
  const productsData: SeedProduct[] = [
    {
      name: "峰顶系列越野背包",
      subtitle: "超长距离赛事专用",
      slug: "summit-ultra-pack",
      description: "为越野百公里与多日徒步打造的旗舰背包，兼具轻量与稳定支撑。",
      specs: { capacity: "32L", weight: "820g", material: "UltraWeave" },
      coverImage: "/images/products/summit-ultra-pack/cover.jpg",
      gallery: [
        "/images/products/summit-ultra-pack/1.jpg",
        "/images/products/summit-ultra-pack/2.jpg",
      ],
      price: "1599.00",
      compareAtPrice: "1899.00",
      categorySlug: "performance-packs",
      variants: [],
    },
    {
      name: "疾风越野背包",
      subtitle: "全场景训练伙伴",
      slug: "gale-trail-pack",
      description: "配备可调式束带与快速补给袋，满足日常训练与周末赛事。",
      specs: { capacity: "18L", weight: "540g", material: "Robic" },
      coverImage: "/images/products/gale-trail-pack/cover.jpg",
      gallery: [
        "/images/products/gale-trail-pack/1.jpg",
        "/images/products/gale-trail-pack/2.jpg",
      ],
      price: "899.00",
      categorySlug: "performance-packs",
      variants: [
        {
          sku: "GALPACK-BLK-S",
          attrs: { size: "S", color: "曜石黑" },
          priceDelta: "0",
          stock: 15,
        },
        {
          sku: "GALPACK-BLK-M",
          attrs: { size: "M", color: "曜石黑" },
          priceDelta: "0",
          stock: 20,
        },
        {
          sku: "GALPACK-RED-M",
          attrs: { size: "M", color: "烈焰红" },
          priceDelta: "50",
          stock: 10,
        },
      ],
    },
    {
      name: "星尘一体式帐篷",
      subtitle: "四季适配双人空间",
      slug: "stardust-shelter",
      description: "采用高强度碳纤维支架与双向通风系统，保障山地露营舒适性。",
      specs: { capacity: "2人", floorArea: "29sqft", waterproof: "5000mm" },
      coverImage: "/images/products/stardust-shelter/cover.jpg",
      gallery: [
        "/images/products/stardust-shelter/1.jpg",
        "/images/products/stardust-shelter/2.jpg",
      ],
      price: "2699.00",
      categorySlug: "light-tents",
      variants: [],
    },
    {
      name: "流光单人帐",
      subtitle: "快搭即走",
      slug: "lumina-solo-tent",
      description: "极简搭建结构，10 分钟以内即可完成固定，适合快速行程。",
      specs: { capacity: "1人", weight: "960g", material: "Dyneema" },
      coverImage: "/images/products/lumina-solo-tent/cover.jpg",
      gallery: [
        "/images/products/lumina-solo-tent/1.jpg",
        "/images/products/lumina-solo-tent/2.jpg",
      ],
      price: "1999.00",
      categorySlug: "light-tents",
      variants: [],
    },
    {
      name: "疾影碳纤维登山杖",
      subtitle: "折叠式碳纤维",
      slug: "shadow-carbon-poles",
      description: "三节折叠结构，搭配快锁系统，提高攀升效率。",
      specs: { lengthRange: "110-135cm", weight: "420g/pair" },
      coverImage: "/images/products/shadow-carbon-poles/cover.jpg",
      gallery: [
        "/images/products/shadow-carbon-poles/1.jpg",
        "/images/products/shadow-carbon-poles/2.jpg",
      ],
      price: "699.00",
      categorySlug: "training-gear",
      variants: [],
    },
    {
      name: "冰羽保温水壶",
      subtitle: "48 小时长效保冷",
      slug: "frost-hydration-bottle",
      description: "双层真空结构，背包侧袋友好尺寸，提供运动所需补水。",
      specs: { volume: "650ml", insulation: "48h cold / 24h hot" },
      coverImage: "/images/products/frost-hydration-bottle/cover.jpg",
      gallery: [
        "/images/products/frost-hydration-bottle/1.jpg",
        "/images/products/frost-hydration-bottle/2.jpg",
      ],
      price: "199.00",
      categorySlug: "training-gear",
      variants: [],
    },
    {
      name: "疾风越野背心",
      subtitle: "多口袋储物设计",
      slug: "gale-trail-vest",
      description: "肩部与后背均采用蜂巢透气网布，长距离穿着仍保持干爽。",
      specs: { fabric: "AeroMesh", weight: "210g" },
      coverImage: "/images/products/gale-trail-vest/cover.jpg",
      gallery: [
        "/images/products/gale-trail-vest/1.jpg",
        "/images/products/gale-trail-vest/2.jpg",
      ],
      price: "599.00",
      categorySlug: "training-gear",
      variants: [
        {
          sku: "GALE-VEST-SM",
          attrs: { size: "S/M", color: "冰川蓝" },
          priceDelta: "0",
          stock: 25,
        },
        {
          sku: "GALE-VEST-LX",
          attrs: { size: "L/XL", color: "冰川蓝" },
          priceDelta: "0",
          stock: 18,
        },
      ],
    },
    {
      name: "夜行反光袖套",
      subtitle: "高亮安全模块",
      slug: "night-glow-sleeves",
      description: "双面反光纤维与压缩支撑相结合，夜间跑步更安心。",
      specs: { material: "Reflective Knit", weight: "48g/pair" },
      coverImage: "/images/products/night-glow-sleeves/cover.jpg",
      gallery: [
        "/images/products/night-glow-sleeves/1.jpg",
        "/images/products/night-glow-sleeves/2.jpg",
      ],
      price: "149.00",
      categorySlug: "training-gear",
      variants: [],
    },
  ];

  for (const product of productsData) {
    const category = categoryMap.get(product.categorySlug);
    if (!category) {
      throw new Error(`未找到分类：${product.categorySlug}`);
    }

    await prisma.product.create({
      data: {
        name: product.name,
        subtitle: product.subtitle,
        slug: product.slug,
        description: product.description,
        specs: product.specs,
        coverImage: product.coverImage,
        gallery: product.gallery,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        status: ProductStatus.PUBLISHED,
        category: {
          connect: { id: category.id },
        },
        variants: {
          create: product.variants.map((variant) => ({
            sku: variant.sku,
            attrs: variant.attrs,
            priceDelta: variant.priceDelta,
            stock: variant.stock,
          })),
        },
      },
    });
  }

  // 文章与页面示例
  await prisma.article.createMany({
    data: [
      {
        title: "越野跑装备打包指南",
        slug: "trail-running-pack-list",
        excerpt: "从背包容量到补给布置，帮助你更高效地准备赛事装备。",
        content:
          "结合经验选出高海拔赛事的装备清单，涵盖保温、补水与夜间照明等关键模块。",
        coverImage: "/images/blog/trail-running-pack-list/cover.jpg",
        status: PublishStatus.PUBLISHED,
        authorId: adminUser.id,
        publishedAt: new Date(),
      },
      {
        title: "轻量露营营地搭建技巧",
        slug: "light-camping-setup",
        excerpt: "掌握地钉布局与张力调节，让帐篷在复杂环境依然稳固。",
        content:
          "针对山地与海边环境给出不同的扎营策略，附带夜间防潮与保暖建议。",
        coverImage: "/images/blog/light-camping-setup/cover.jpg",
        status: PublishStatus.PUBLISHED,
        authorId: adminUser.id,
        publishedAt: new Date(),
      },
    ],
  });

  await prisma.page.create({
    data: {
      title: "关于星翼户外",
      slug: "about-us",
      content:
        "我们专注高强度户外与耐力运动装备设计，团队由越野跑者与工业设计师组成。",
      status: PublishStatus.PUBLISHED,
      authorId: adminUser.id,
      publishedAt: new Date(),
    },
  });

  console.log("✅ 演示数据写入完成。");
}

main()
  .catch((error) => {
    console.error("❌ 数据填充失败", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
