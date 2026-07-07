import { prisma } from "@/lib/prisma";
import HomeSectionManager from "@/components/HomeSectionManager";

export const dynamic = "force-dynamic";

export default async function HomepageBuilderPage() {
  const [sections, collections, categories] = await Promise.all([
    prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.collection.findMany({ orderBy: { title: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-2">Homepage layout</h1>
      <p className="text-char/60 text-sm mb-6">
        Reorder, hide, or add sections to completely rearrange the homepage — no code needed.
        Changes apply immediately.
      </p>
      <HomeSectionManager sections={sections} collections={collections} categories={categories} />
    </div>
  );
}
