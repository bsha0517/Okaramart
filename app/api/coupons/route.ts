import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const CouponSchema = z.object({
  code: z.string().min(3).transform((s) => s.toUpperCase()),
  description: z.string().optional(),
  discountType: z.enum(["PERCENT", "FLAT"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

function requireManager(role: string | undefined) {
  return role === "SUPER_ADMIN" || role === "MANAGER";
}

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!requireManager(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = CouponSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const coupon = await prisma.coupon.create({
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
