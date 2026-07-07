import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ZoneSchema = z.object({
  areaName: z.string().min(1),
  deliveryFee: z.number().min(0),
  etaMinutes: z.number().int().positive(),
});

function canManage(role: string | undefined) {
  return role === "SUPER_ADMIN" || role === "MANAGER";
}

export async function GET() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { areaName: "asc" } });
  return NextResponse.json(zones);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManage((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = ZoneSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const zone = await prisma.deliveryZone.create({ data: parsed.data });
    return NextResponse.json(zone, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Area already exists" }, { status: 409 });
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
