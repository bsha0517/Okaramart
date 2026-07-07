import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const StaffSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^03\d{9}$/),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "MANAGER", "PACKER", "RIDER"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const staff = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "MANAGER", "PACKER", "RIDER"] } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = StaffSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        role: parsed.data.role,
        passwordHash,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
