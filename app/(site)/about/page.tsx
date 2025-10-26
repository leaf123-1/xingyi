import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "关于我们",
  description: "了解 Xingyi Sports 的团队背景、设计理念与供应链体系。",
};

const milestones = [
  { year: "2018", description: "成立工作室，聚焦越野跑背包开发" },
  { year: "2020", description: "推出首个碳纤维帐篷系列并建立自营供应链" },
  { year: "2023", description: "上线支付抽象独立站，支持全球多渠道销售" },
];

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: "about-us" } });

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-16">
      <SectionHeading
        eyebrow="关于我们"
        title={page?.title ?? "星翼户外"}
        description={
          page?.content ?? "我们专注高强度户外与耐力运动装备设计，兼顾轻量化与耐久性。"
        }
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 text-sm leading-7 text-muted-foreground">
          <p>
            团队由越野跑者、工业设计师与供应链专家组成，在上海与成都设有研发基地。我们相信轻量并不意味着牺牲安全性，因此在材料、结构与工艺上持续投入，确保产品能适应极端环境。
          </p>
          <p>
            在数字化层面，我们构建了一套可配置的后台与前台组件体系，覆盖商品、库存、订单与内容管理，配合支付宝与微信支付抽象，帮助品牌快速上线并扩展新市场。
          </p>
          <p>
            我们也积极与社区跑者合作，持续收集用户反馈，推动产品迭代。透过 UGC 与赛事共创，让产品在真实场景中持续被验证。
          </p>
        </div>
        <div className="relative h-[360px] overflow-hidden rounded-[32px] border border-border/60">
          <Image
            src="https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=1200&q=80"
            alt="团队测试装备"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <section className="space-y-6">
        <SectionHeading
          eyebrow="发展历程"
          title="从工作室到全链路品牌"
          description="关键节点帮助我们构建起独立站能力、供应链协同与国际化支付体系。"
        />
        <ol className="space-y-4">
          {milestones.map((item) => (
            <li
              key={item.year}
              className="flex items-start gap-4 rounded-3xl border border-border/60 bg-white p-5 shadow-sm"
            >
              <span className="text-lg font-semibold text-primary">{item.year}</span>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
