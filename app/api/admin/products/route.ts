import { NextResponse } from "next/server";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { productInputSchema, parseDecimal, parseJson } from "./schema";

export const GET = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status && status in ProductStatus) {
    where.status = status as ProductStatus;
  }
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      variants: true,
    },
    take: 200,
  });
  return NextResponse.json({ data: products });
});

export const POST = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request) => {
  const json = await request.json();
  const payload = productInputSchema.parse(json);
  const price = parseDecimal(payload.price);
  if (!price) {
    return NextResponse.json({ message: "价格格式不正确" }, { status: 400 });
  }
  const compareAtPrice = parseDecimal(payload.compareAtPrice ?? undefined);
  const specs = parseJson(payload.specs);
  const variants = payload.variants?.map((variant) => ({
    sku: variant.sku,
    attrs: parseJson(variant.attrs) ?? undefined,
    priceDelta: parseDecimal(variant.priceDelta ?? "0") ?? new Prisma.Decimal(0),
    stock: variant.stock ?? 0,
    barcode: variant.barcode ?? null,
  }));
  const product = await prisma.product.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      subtitle: payload.subtitle,
      description: payload.description,
      specs,
      coverImage: payload.coverImage,
      gallery: payload.gallery ?? [],
      price,
      compareAtPrice: compareAtPrice ?? null,
      status: payload.status,
      categoryId: payload.categoryId ?? null,
      variants: variants ? { create: variants } : undefined,
    },
    include: {
      category: true,
      variants: true,
    },
  });
  return NextResponse.json(product, { status: 201 });
});
