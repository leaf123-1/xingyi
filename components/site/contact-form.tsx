"use client";

import { z } from "zod";
import Link from "next/link";
import { MinimalForm } from "@/components/forms/MinimalForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const inputBaseClass =
  "h-12 rounded-3xl border-input bg-background px-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textareaBaseClass =
  "w-full rounded-3xl border-input bg-background px-4 py-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const contactSchema = z
  .object({
    name: z.string().min(2, "请输入姓名"),
    email: z.string().email("请输入有效邮箱").optional(),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{6,}$/u, "请输入有效电话")
      .optional(),
    message: z.string().min(10, "请描述需求"),
    consent: z.literal(true, {
      errorMap: () => ({ message: "请勾选隐私条款" }),
    }),
  })
  .refine((data) => data.email || data.phone, {
    message: "请至少填写邮箱或电话之一", // 自定义校验，确保客服可回访
    path: ["email"],
  });

type ContactValues = z.infer<typeof contactSchema>;

const defaultValues: ContactValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
  consent: true,
};

export default function ContactForm() {
  return (
    <MinimalForm
      schema={contactSchema}
      defaultValues={defaultValues}
      submitLabel="提交"
      successMessage="已收到，我们会尽快联系你。"
      resetOnSuccess
      onSubmit={async (values) => {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, sourcePath: window.location.pathname }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "提交失败，请稍后再试");
        }

        return { reset: true };
      }}
      fields={[
        {
          name: "name",
          label: "姓名",
          required: true,
          description: "方便我们使用正确的称呼。",
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              placeholder="你的名字"
              autoComplete="name"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "email",
          label: "邮箱",
          description: "与电话二选一，便于团队联系。",
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              type="email"
              placeholder="contact@team.com"
              autoComplete="email"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "phone",
          label: "电话",
          description: "请留下可接听号码，含区号更易联络。",
          render: ({ field, inputId }) => (
            <Input
              {...field}
              id={inputId}
              placeholder="可选：+86 138xxxxxxx"
              autoComplete="tel"
              className={inputBaseClass}
            />
          ),
        },
        {
          name: "message",
          label: "需求简述",
          required: true,
          description: "尽量提供项目背景、预算或时间节点，方便快速响应。",
          render: ({ field, inputId }) => (
            <Textarea
              {...field}
              id={inputId}
              rows={4}
              placeholder="简要描述你的项目、预算或时间计划"
              className={textareaBaseClass}
            />
          ),
        },
        {
          name: "consent",
          label: "隐私条款确认",
          required: true,
          description: (
            <span>
              勾选即代表你已阅读并同意我们的
              {" "}
              <Link href="/privacy" className="underline">
                隐私条款
              </Link>
              ，信息仅用于本次回访。
            </span>
          ),
          render: ({ field, inputId }) => (
            <input
              id={inputId}
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              className="h-5 w-5 rounded-md border border-input text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ),
        },
      ]}
    />
  );
}
