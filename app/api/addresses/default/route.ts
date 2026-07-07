import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerSession";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ address: null });

  const address = await prisma.address.findFirst({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ address });
}

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const { label, addressLine, area, lat, lng } = await req.json();

  // New picks become the default; unset any previous default
  await prisma.address.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });

  const address = await prisma.address.create({
    data: {
      userId: session.userId,
      label: label || "Current location",
      addressLine: addressLine || "Pinned location",
      area: area || "Okara",
      lat, lng,
      isDefault: true,
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
