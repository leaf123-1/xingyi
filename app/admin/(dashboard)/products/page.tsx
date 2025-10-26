import { prisma } from "@/lib/prisma";
import { ProductManager, ProductFormState } from "@/components/admin/products-manager";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        variants: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const formatted: ProductFormState[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle ?? undefined,
    description: product.description,
    specs: product.specs ? JSON.stringify(product.specs, null, 2) : "{}",
    coverImage: product.coverImage,
    gallery: product.gallery ?? [],
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : undefined,
    status: product.status,
    categoryId: product.categoryId,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      priceDelta: variant.priceDelta.toString(),
      stock: variant.stock,
      attrs: variant.attrs ? JSON.stringify(variant.attrs, null, 2) : "{}",
      barcode: variant.barcode ?? undefined,
    })),
  }));

  return <ProductManager products={formatted} categories={categories} />;
}
