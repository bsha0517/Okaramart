import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  phone: z.string().regex(/^03\d{9}$/),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number and password" }, { status: 400 });
  }
  const { phone, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "No account found for this number — try signing up." }, { status: 404 });
  }
  if (!user.isActive) {
    return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
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
