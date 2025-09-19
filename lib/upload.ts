import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import mime from "mime";

/**
 * 上传配置枚举，方便在 API 与组件中复用
 */
const STORAGE_DRIVER = process.env.STORAGE_DRIVER ?? "local";
const LOCAL_DIR = process.env.UPLOAD_LOCAL_DIR ?? "public/uploads";

let s3Client: S3Client | null = null;

/**
 * 上传结果统一结构
 */
export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

interface UploadInput {
  buffer: Buffer;
  filename: string;
  contentType?: string;
  directory?: string;
}

/**
 * 生成随机文件名，保留原始扩展名
 */
function generateFileName(filename: string) {
  const ext = path.extname(filename);
  return `${Date.now()}-${nanoid(8)}${ext ? ext : ""}`;
}

function buildS3Client() {
  if (s3Client) {
    return s3Client;
  }
  const region = process.env.S3_REGION;
  const endpoint = process.env.S3_ENDPOINT;
  if (!region && !endpoint) {
    throw new Error("S3 存储未配置区域或自定义 Endpoint");
  }
  s3Client = new S3Client({
    region: region || "auto",
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials: process.env.S3_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        }
      : undefined,
  });
  return s3Client;
}

function buildPublicUrl(key: string) {
  const custom = process.env.S3_PUBLIC_URL;
  if (custom) {
    return `${custom.replace(/\/$/, "")}/${key}`;
  }
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION ?? "";
  if (!bucket) {
    throw new Error("S3 存储缺少 Bucket 配置");
  }
  if (process.env.S3_ENDPOINT) {
    return `${process.env.S3_ENDPOINT.replace(/\/$/, "")}/${bucket}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function resolveLocalPath(key: string) {
  return path.resolve(process.cwd(), LOCAL_DIR, key);
}

/**
 * 将文件上传到本地目录
 */
async function uploadToLocal({ buffer, filename, contentType, directory }: UploadInput): Promise<UploadResult> {
  const safeDir = directory ? directory.replace(/\\|\.+/g, "") : "";
  const key = path.posix.join(safeDir, generateFileName(filename));
  const targetDir = path.resolve(process.cwd(), LOCAL_DIR, safeDir);
  await ensureDir(targetDir);
  const targetPath = resolveLocalPath(key);
  await fs.writeFile(targetPath, buffer);
  const type = contentType || mime.getType(filename) || "application/octet-stream";
  // 假定本地目录挂载于 public 下，直接通过 /uploads 访问
  const publicBase = LOCAL_DIR.startsWith("public/")
    ? LOCAL_DIR.replace(/^public\//, "")
    : LOCAL_DIR;
  const url = `/${publicBase.replace(/\/$/, "")}/${key}`;
  return { key, url, size: buffer.byteLength, contentType: type };
}

/**
 * 上传到 S3 兼容对象存储
 */
async function uploadToS3({ buffer, filename, contentType, directory }: UploadInput): Promise<UploadResult> {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error("S3 存储缺少 Bucket 配置");
  }
  const key = path.posix.join(directory ?? "", generateFileName(filename));
  const client = buildS3Client();
  const type = contentType || mime.getType(filename) || "application/octet-stream";
  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: type,
  };
  await client.send(new PutObjectCommand(input));
  const url = buildPublicUrl(key);
  return { key, url, size: buffer.byteLength, contentType: type };
}

export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  if (STORAGE_DRIVER === "s3") {
    return uploadToS3(input);
  }
  return uploadToLocal(input);
}

export async function deleteFile(key: string) {
  if (!key) return;
  if (STORAGE_DRIVER === "s3") {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) return;
    const client = buildS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    return;
  }
  const target = resolveLocalPath(key);
  await fs.rm(target, { force: true });
}

export function getStorageDriver() {
  return STORAGE_DRIVER;
}

