import type { Metadata } from "next";
import ContactForm from "@/components/site/contact-form";
import { MinimalForm } from "@/components/site/minimal-form";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "联系顾问",
  description: "提交需求以获取独立站搭建方案，我们将在 24 小时内回访。",
};

const highlights = [
  "专业顾问对接支付与物流流程",
  "根据品类提供库存与内容策略",
  "上线后提供 7x12 小时技术支持",
];

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-8">
        <SectionHeading
          eyebrow="联系顾问"
          title="为你的体育器材业务定制方案"
          description="填写表单即可预约演示，我们会根据品牌阶段给出支付、库存、内容与营销的整合建议。"
        />
        <ul className="space-y-4 rounded-3xl border border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          提交后我们会在后台 ContactMessage 表中记录来源路径，方便追踪渠道效果。
        </p>
      </div>
      <MinimalForm
        title="告诉我们你的需求"
        description="填写以下信息，顾问会通过邮箱或电话联系。"
      >
        <ContactForm />
      </MinimalForm>
    </div>
  );
}
