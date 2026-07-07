import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const SignupSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^03\d{9}$/, "Enter a valid Pakistani mobile number, e.g. 03001234567"),
  email: z.string().email().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { name, phone, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "This number is already registered — try logging in." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await prisma.user.create({
      data: { name, phone, email, passwordHash, role: "CUSTOMER" },
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "That email is already in use on another account." }, { status: 409 });
    }
    throw e;
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ userId: user.id, phone: user.phone, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, phone: user.phone } });
  res.cookies.set("customer_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
