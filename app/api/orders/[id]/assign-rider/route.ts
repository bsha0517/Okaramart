import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const riderId = (session?.user as any)?.id;
  if (role !== "RIDER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.riderId) return NextResponse.json({ error: "Already assigned to a rider" }, { status: 409 });

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { riderId, statusHistory: { create: { status: order.status, note: "Rider assigned" } } },
  });

  return NextResponse.json(updated);
}
