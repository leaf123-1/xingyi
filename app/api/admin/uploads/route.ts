import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth";
import { uploadFile, deleteFile } from "@/lib/upload";

export const runtime = "nodejs";

export const POST = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "缺少文件" }, { status: 400 });
  }
  const directory = formData.get("directory");
  const arrayBuffer = await file.arrayBuffer();
  const result = await uploadFile({
    buffer: Buffer.from(arrayBuffer),
    filename: file.name,
    contentType: file.type,
    directory: typeof directory === "string" ? directory : undefined,
  });
  return NextResponse.json(result, { status: 201 });
});

export const DELETE = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const payload = await request.json().catch(() => null);
  const key = payload?.key;
  if (!key || typeof key !== "string") {
    return NextResponse.json({ message: "缺少文件 Key" }, { status: 400 });
  }
  await deleteFile(key);
  return NextResponse.json({ success: true });
});
