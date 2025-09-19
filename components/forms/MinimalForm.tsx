"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { z, type ZodTypeAny } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, FieldPath, FieldValues, useForm, type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MinimalFormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  /** 字段名称，需要与 schema 中的键一致 */
  name: TName;
  /** 字段标签，展示在输入框上方 */
  label: ReactNode;
  /** 字段描述信息，展示在输入区域下方 */
  description?: ReactNode;
  /** 是否为必填项，用于显示 * 提示 */
  required?: boolean;
  /** 自定义渲染函数，返回任何输入组件 */
  render: (
    helpers: {
      field: ControllerRenderProps<TFieldValues, TName>;
      form: UseFormReturn<TFieldValues>;
      inputId: string;
    },
  ) => ReactNode;
  /** 额外的布局样式 */
  className?: string;
};

export type MinimalFormSubmitResult = void | { reset?: boolean; message?: string };

interface MinimalFormProps<TSchema extends ZodTypeAny> {
  /** zod 校验 schema，实现强类型校验 */
  schema: TSchema;
  /** 默认值，与 schema 类型保持一致 */
  defaultValues: z.infer<TSchema>;
  /** 字段配置，决定渲染顺序与布局 */
  fields: MinimalFormField<z.infer<TSchema>>[];
  /** 提交按钮文案 */
  submitLabel?: string;
  /** 成功时展示的默认提示语 */
  successMessage?: string;
  /** 提交后是否自动重置表单为默认值 */
  resetOnSuccess?: boolean;
  /** 自定义 className，适配容器布局 */
  className?: string;
  /** 表单底部插槽，例如额外按钮或辅助信息 */
  footer?: ReactNode;
  /** 提交逻辑，支持同步或异步 */
  onSubmit: (
    values: z.infer<TSchema>,
    helpers: { form: UseFormReturn<z.infer<TSchema>> },
  ) => MinimalFormSubmitResult | Promise<MinimalFormSubmitResult>;
}

/**
 * MinimalForm：统一的极简表单容器，封装字段布局、校验与反馈提示。
 * - label 始终位于输入框上方；
 * - 描述与错误信息集中展示在输入框下方；
 * - 内置必填 * 标记与更大的点击/触摸区域；
 * - 搭配 zod + react-hook-form，保持类型安全。
 */
export function MinimalForm<TSchema extends ZodTypeAny>({
  schema,
  defaultValues,
  fields,
  submitLabel = "提交",
  successMessage,
  resetOnSuccess = false,
  className,
  footer,
  onSubmit,
}: MinimalFormProps<TSchema>) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });
  const formId = useId();
  const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(null);

  const handleSubmit: SubmitHandler<z.infer<TSchema>> = async (values) => {
    setStatus(null);
    try {
      const result = await onSubmit(values, { form });
      if (resetOnSuccess || result?.reset) {
        form.reset(defaultValues);
      }
      const message = result?.message ?? successMessage;
      if (message) {
        setStatus({ type: "success", message });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : typeof error === "string" ? error : "提交失败，请稍后重试";
      setStatus({ type: "error", message });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
        noValidate
      >
        {fields.map((fieldConfig) => {
          const fieldKey = String(fieldConfig.name);
          const inputId = `${formId}-${fieldKey}`;
          return (
            <FormField
              key={fieldKey}
              control={form.control}
              name={fieldConfig.name}
              render={({ field }) => (
                <FormItem className={cn("space-y-3", fieldConfig.className)}>
                  <FormLabel htmlFor={inputId} className="flex items-center gap-2 text-base font-semibold">
                    <span>{fieldConfig.label}</span>
                    {fieldConfig.required ? <span className="text-destructive">*</span> : null}
                  </FormLabel>
                  <FormControl id={inputId}>
                    {fieldConfig.render({ field: { ...field, ref: field.ref }, form, inputId })}
                  </FormControl>
                  {fieldConfig.description ? (
                    <FormDescription className="text-sm text-muted-foreground">
                      {fieldConfig.description}
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[160px]">
            {form.formState.isSubmitting ? "提交中..." : submitLabel}
          </Button>
          {footer}
        </div>
        {status ? (
          <p
            className={cn(
              "text-sm",
              status.type === "success" ? "text-emerald-600" : "text-destructive",
            )}
          >
            {status.message}
          </p>
        ) : null}
      </form>
    </Form>
  );
}
