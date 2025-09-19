"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  directory?: string;
  onUploaded: (url: string, key: string) => void;
  className?: string;
}

/**
 * 通用上传组件：支持本地存储与 S3，成功后回调 URL
 */
export function MediaUploader({ directory = "products", onUploaded, className }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", directory);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const result = await response.json();
      onUploaded(result.url as string, result.key as string);
    } catch (err) {
      console.error("上传失败", err);
      setError("上传失败，请重试");
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => inputRef.current?.click()}>
        {loading ? "上传中..." : "上传图片"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
