import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^03\d{9}$/),
  code: z.string().length(4),
  purpose: z.enum(["SIGNUP", "LOGIN"]),
  name: z.string().min(1).optional(), // required for SIGNUP
  email: z.string().email().optional(),
});

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, code, purpose, name, email } = parsed.data;

  const otp = await prisma.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.expiresAt < new Date()) {
    return NextResponse.json({ error: "Code expired — request a new one." }, { status: 400 });
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts — request a new code." }, { status: 429 });
  }
  if (otp.code !== code) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  let user = await prisma.user.findUnique({ where: { phone } });

  if (purpose === "SIGNUP") {
    if (user) {
      return NextResponse.json({ error: "Account already exists — please log in instead." }, { status: 409 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required to create an account." }, { status: 400 });
    }
    try {
      user = await prisma.user.create({
        data: { phone, name, email, role: "CUSTOMER" },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        return NextResponse.json({ error: "That email is already in use on another account." }, { status: 409 });
      }
      throw e;
    }
  }

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (!user.isActive) {
    return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
  }

  // Issue a lightweight session token for the customer-facing app.
  // (Kept separate from NextAuth, which handles staff/admin login.)
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
