import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN" && role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { csv } = await req.json();
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
  }

  const rows = parseCsv(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV has no data rows" }, { status: 400 });
  }

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

  const results = { created: 0, updated: 0, errors: [] as { row: number; error: string }[] };

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const name = r.name?.trim();
      const sku = r.sku?.trim();
      const price = parseFloat(r.price);
      const stockQty = parseInt(r.stockQty || r.stock || "0", 10);
      const unit = r.unit?.trim() || "1 pc";
      const categoryInput = (r.category || r.categorySlug || "").trim();

      if (!name || !sku || isNaN(price)) {
        results.errors.push({ row: i + 2, error: "Missing required field: name, sku, or valid price" });
        continue;
      }

      const category = categoryBySlug.get(slugify(categoryInput)) || categoryByName.get(categoryInput.toLowerCase());
      if (!category) {
        results.errors.push({ row: i + 2, error: `Unknown category "${categoryInput}" — create it first in /admin` });
        continue;
      }

      const slug = r.slug?.trim() || slugify(name);

      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) {
        await prisma.product.update({
          where: { sku },
          data: { name, slug, price, stockQty, unit, categoryId: category.id, imageUrl: r.imageUrl || undefined },
        });
        results.updated++;
      } else {
        await prisma.product.create({
          data: { name, slug, sku, price, stockQty, unit, categoryId: category.id, imageUrl: r.imageUrl || undefined },
        });
        results.created++;
      }
    } catch (e: any) {
      results.errors.push({ row: i + 2, error: e.message || "Unknown error" });
    }
  }

  return NextResponse.json(results);
}
