import { prisma } from "./prisma";

/** Returns categories ordered parent-then-children, with a display label indenting subcategories. */
export async function getCategoriesForSelect() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const topLevel = categories.filter((c) => !c.parentId);
  const result: { id: string; name: string; label: string }[] = [];

  for (const parent of topLevel) {
    result.push({ id: parent.id, name: parent.name, label: parent.name });
    const children = categories.filter((c) => c.parentId === parent.id);
    for (const child of children) {
      result.push({ id: child.id, name: child.name, label: `— ${child.name}` });
    }
  }
  return result;
}
