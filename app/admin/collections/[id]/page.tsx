import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CollectionItemManager from "@/components/CollectionItemManager";

export const dynamic = "force-dynamic";

export default async function ManageCollectionPage({ params }: { params: { id: string } }) {
  const [collection, allProducts] = await Promise.all([
    prisma.collection.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true }, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!collection) notFound();

  return (
    <div>
      <a href="/admin/collections" className="text-canal text-sm font-medium mb-3 inline-block">← All carousel rows</a>
      <h1 className="font-display text-2xl text-canal mb-6">{collection.title}</h1>
      <CollectionItemManager collectionId={collection.id} items={collection.items} allProducts={allProducts} />
    </div>
  );
}
