import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

const RequestOtpSchema = z.object({
  phone: z.string().regex(/^03\d{9}$/, "Enter a valid Pakistani mobile number, e.g. 03001234567"),
  purpose: z.enum(["SIGNUP", "LOGIN"]),
});

const OTP_TTL_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RequestOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, purpose } = parsed.data;

  // Signup: phone must not already have an account. Login: it must.
  const existingUser = await prisma.user.findUnique({ where: { phone } });
  if (purpose === "SIGNUP" && existingUser) {
    return NextResponse.json({ error: "This number is already registered — try logging in." }, { status: 409 });
  }
  if (purpose === "LOGIN" && !existingUser) {
    return NextResponse.json({ error: "No account found for this number — try signing up." }, { status: 404 });
  }

  // Rate-limit resends per phone
  const recent = await prisma.otpCode.findFirst({
    where: { phone, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
    const waitSec = Math.ceil(
      RESEND_COOLDOWN_SECONDS - (Date.now() - recent.createdAt.getTime()) / 1000
    );
    return NextResponse.json({ error: `Please wait ${waitSec}s before requesting another code.` }, { status: 429 });
  }

  const code = generateCode();
  await prisma.otpCode.create({
    data: {
      phone,
      code,
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  await sendSms(phone, `Your Okara Mart verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`);

  return NextResponse.json({ ok: true, expiresInSeconds: OTP_TTL_MINUTES * 60 });
}
