import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Edit product</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          images: product.images ?? [],
          brand: product.brand ?? "",
          attributes: (product.attributes as Record<string, string>) ?? {},
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() ?? "",
          unit: product.unit,
          sku: product.sku,
          stockQty: product.stockQty.toString(),
          lowStockAlertAt: product.lowStockAlertAt.toString(),
          categoryId: product.categoryId,
        }}
      />
    </div>
  );
}
