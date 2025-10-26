import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockProducts = Array.from({ length: 8 }).map((_, index) => ({
  id: `demo-${index}`,
  name: `专业装备 ${index + 1}`,
  price: 1999 + index * 120,
  category: index % 2 === 0 ? "帐篷" : "背包",
  image: index % 2 === 0
    ? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
    : "https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=800&q=80",
}));

export function ProductGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {mockProducts.map((product) => (
        <div key={product.id} className="group flex flex-col overflow-hidden rounded-2xl border">
          <div className="relative h-60 w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute left-4 top-4">
              <Badge>{product.category}</Badge>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">适配高海拔、多日线</p>
              </div>
              <span className="text-base font-semibold text-primary">¥{product.price}</span>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link prefetch href={`/products/${product.id}`}>查看详情</Link>
              </Button>
              <Button variant="outline" className="flex-1">
                加入购物车
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
