import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth";
import { productInputSchema, parseDecimal, parseJson } from "../schema";

const paramsSchema = z.object({ id: z.string().min(1) });

const guard = withRole(["ADMIN", "EDITOR"], async (_ctx, request: Request, context: { params: { id: string } }) => {
  const { id } = paramsSchema.parse(context.params);
  switch (request.method) {
    case "GET": {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: true,
        },
      });
      if (!product) {
        return NextResponse.json({ message: "未找到商品" }, { status: 404 });
      }
      return NextResponse.json(product);
    }
    case "PUT": {
      const json = await request.json();
      const payload = productInputSchema.parse(json);
      const price = parseDecimal(payload.price);
      if (!price) {
        return NextResponse.json({ message: "价格格式不正确" }, { status: 400 });
      }
      const compareAtPrice = parseDecimal(payload.compareAtPrice ?? undefined);
      const specs = parseJson(payload.specs);
      const variants = payload.variants ?? [];
      const result = await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
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
          },
        });
        const incomingIds = variants.filter((variant) => variant.id).map((variant) => variant.id!) as string[];
        await tx.variant.deleteMany({
          where: {
            productId: id,
            ...(incomingIds.length ? { id: { notIn: incomingIds } } : {}),
          },
        });
        for (const variant of variants) {
          const data = {
            sku: variant.sku,
            attrs: parseJson(variant.attrs) ?? undefined,
            priceDelta: parseDecimal(variant.priceDelta ?? "0") ?? new Prisma.Decimal(0),
            stock: variant.stock ?? 0,
            barcode: variant.barcode ?? null,
          };
          if (variant.id) {
            await tx.variant.update({ where: { id: variant.id }, data });
          } else {
            await tx.variant.create({ data: { ...data, productId: id } });
          }
        }
        return tx.product.findUnique({
          where: { id },
          include: {
            category: true,
            variants: true,
          },
        });
      });
      return NextResponse.json(result);
    }
    case "DELETE": {
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ message: "不支持的请求" }, { status: 405 });
  }
});

export const GET = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const PUT = (request: Request, context: { params: { id: string } }) => guard(request, context);
export const DELETE = (request: Request, context: { params: { id: string } }) => guard(request, context);
