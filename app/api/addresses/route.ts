import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerSession";

export const dynamic = "force-dynamic";

const AddressSchema = z.object({
  label: z.string().default("Home"),
  addressLine: z.string().min(3),
  area: z.string().min(2),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const body = await req.json();
  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const address = await prisma.address.create({
    data: { ...parsed.data, userId: session.userId },
  });

  return NextResponse.json(address, { status: 201 });
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const addresses = await prisma.address.findMany({ where: { userId: session.userId } });
  return NextResponse.json(addresses);
}
