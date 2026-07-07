import { prisma } from "@/lib/prisma";
import CollectionForm from "@/components/CollectionForm";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-2">Homepage carousel rows</h1>
      <p className="text-char/60 text-sm mb-6">
        Custom curated rows (e.g. "Trending Now", "Combo Offers") — separate from the
        automatic per-category rows on the homepage.
      </p>

      <div className="mb-8">
        <CollectionForm />
      </div>

      <div className="space-y-2">
        {collections.map((c) => (
          <a
            key={c.id}
            href={`/admin/collections/${c.id}`}
            className="flex items-center justify-between bg-white border border-canal/10 rounded-xl p-4 hover:border-canal/30"
          >
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-char/50">{c._count.items} products · order {c.sortOrder} · {c.isActive ? "Active" : "Hidden"}</p>
            </div>
            <span className="text-canal text-sm font-semibold">Manage products →</span>
          </a>
        ))}
        {collections.length === 0 && <p className="text-char/40 text-sm">No carousel rows yet — add one above.</p>}
      </div>
    </div>
  );
}
