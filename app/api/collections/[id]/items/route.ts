import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function canManage(role: string | undefined) {
  return role === "SUPER_ADMIN" || role === "MANAGER";
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!canManage((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { productId } = await req.json();

  const existing = await prisma.collectionItem.findFirst({
    where: { collectionId: params.id, productId },
  });
  if (existing) return NextResponse.json({ error: "Product already in this collection" }, { status: 409 });

  const maxOrder = await prisma.collectionItem.aggregate({
    where: { collectionId: params.id },
    _max: { sortOrder: true },
  });

  const item = await prisma.collectionItem.create({
    data: { collectionId: params.id, productId, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!canManage((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { itemId } = await req.json();
  await prisma.collectionItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
