import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PACKER: ["PACKING", "PACKED"],
  RIDER: ["OUT_FOR_DELIVERY", "DELIVERED"],
  MANAGER: ["CONFIRMED", "PACKING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"],
  SUPER_ADMIN: ["CONFIRMED", "PACKING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"],
};

const CUSTOMER_MESSAGES: Record<string, (orderNumber: string) => string> = {
  CONFIRMED: (o) => `Your Okara Mart order ${o} is confirmed and being prepared.`,
  PACKED: (o) => `Your Okara Mart order ${o} is packed and will be out for delivery soon.`,
  OUT_FOR_DELIVERY: (o) => `Your Okara Mart order ${o} is out for delivery!`,
  DELIVERED: (o) => `Your Okara Mart order ${o} has been delivered. Thanks for shopping with us!`,
  CANCELLED: (o) => `Your Okara Mart order ${o} has been cancelled.`,
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status, note, otp } = await req.json();

  if (!ALLOWED_TRANSITIONS[role]?.includes(status)) {
    return NextResponse.json({ error: `Role ${role} cannot set status ${status}` }, { status: 403 });
  }

  // COD orders require OTP confirmation at delivery to avoid fake "delivered" marks
  if (status === "DELIVERED") {
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (order?.paymentMethod === "COD" && order.otpCode !== otp) {
      return NextResponse.json({ error: "Incorrect delivery OTP" }, { status: 400 });
    }
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      paymentStatus: status === "DELIVERED" ? "PAID" : undefined,
      statusHistory: { create: { status, note } },
    },
    include: { customer: true },
  });

  const messageFn = CUSTOMER_MESSAGES[status];
  if (messageFn && updated.customer.phone) {
    // Best-effort — don't fail the status update if SMS sending has an issue.
    // Skipped entirely for customers without a phone on file (e.g. some
    // Google/Facebook signups) — nothing to send it to.
    sendSms(updated.customer.phone, messageFn(updated.orderNumber)).catch(() => {});
  }

  return NextResponse.json(updated);
}
