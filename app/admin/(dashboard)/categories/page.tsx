import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });
  return <CategoryManager categories={categories} />;
}
