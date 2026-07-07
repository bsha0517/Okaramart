import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const VALID_TYPES = [
  "VALUE_PROPS", "CATEGORY_CAROUSEL", "BANNERS",
  "ALL_COLLECTIONS", "ALL_CATEGORY_ROWS",
  "SINGLE_COLLECTION", "SINGLE_CATEGORY_ROW",
] as const;

const HomeSectionSchema = z.object({
  type: z.enum(VALID_TYPES),
  refId: z.string().optional(),
  title: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

function canManage(role: string | undefined) {
  return role === "SUPER_ADMIN" || role === "MANAGER";
}

export async function GET() {
  const sections = await prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManage((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = HomeSectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (["SINGLE_COLLECTION", "SINGLE_CATEGORY_ROW"].includes(parsed.data.type) && !parsed.data.refId) {
    return NextResponse.json({ error: "This section type needs a selected collection/category" }, { status: 400 });
  }

  const maxOrder = await prisma.homeSection.aggregate({ _max: { sortOrder: true } });
  const section = await prisma.homeSection.create({
    data: { ...parsed.data, sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json(section, { status: 201 });
}
