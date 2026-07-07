import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  brand: z.string().optional(),
  attributes: z.record(z.string()).optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  unit: z.string().min(1),
  sku: z.string().min(1),
  stockQty: z.number().int().min(0),
  lowStockAlertAt: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().min(1),
});

function canManageInventory(role: string | undefined) {
  return role === "SUPER_ADMIN" || role === "MANAGER";
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!canManageInventory(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ProductSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "SKU or slug already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!canManageInventory(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft delete — keeps order history intact since OrderItem references Product
  await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
