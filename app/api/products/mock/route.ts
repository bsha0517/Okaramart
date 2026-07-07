import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN" && role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await prisma.product.deleteMany({ where: { sku: { startsWith: "MOCK-" } } });
    return NextResponse.json({ deleted: result.count });
  } catch (e: any) {
    // Some mock products may have real orders against them (FK constraint) —
    // deactivate instead of hard-deleting those.
    const deactivated = await prisma.product.updateMany({
      where: { sku: { startsWith: "MOCK-" } },
      data: { isActive: false },
    });
    return NextResponse.json({
      deleted: 0,
      deactivated: deactivated.count,
      note: "Some sample products have real orders against them, so they were hidden instead of deleted.",
    });
  }
}
