import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUnifiedCustomerSession } from "@/lib/customerSession";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const UpdateEmailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export async function POST(req: NextRequest) {
  const session = await getUnifiedCustomerSession();
  if (!session) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid email" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { email: parsed.data.email },
    });
    return NextResponse.json({ email: user.email });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "That email is already in use on another account." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not update email" }, { status: 500 });
  }
}
