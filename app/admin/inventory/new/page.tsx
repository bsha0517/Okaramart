import { prisma } from "@/lib/prisma";
import { getCategoriesForSelect } from "@/lib/categoryTree";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategoriesForSelect();

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Add product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
