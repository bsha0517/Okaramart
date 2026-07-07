import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { orderConfirmedEmail, orderDeliveredEmail } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PACKER: ["PACKING", "PACKED"],
  RIDER: ["OUT_FOR_DELIVERY", "DELIVERED"],
  MANAGER: ["CONFIRMED", "PACKING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"],
  SUPER_ADMIN: ["CONFIRMED", "PACKING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"],
};

const CUSTOMER_SMS_MESSAGES: Record<string, (orderNumber: string) => string> = {
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

  const { status, note, otp, cashCollected } = await req.json();

  if (!ALLOWED_TRANSITIONS[role]?.includes(status)) {
    return NextResponse.json({ error: `Role ${role} cannot set status ${status}` }, { status: 403 });
  }

  // COD orders require: (1) the customer's delivery OTP, confirming the
  // rider is actually at the right doorstep, AND (2) explicit confirmation
  // that cash was collected — the order should never be marked delivered
  // before the money is actually in hand.
  if (status === "DELIVERED") {
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (order?.paymentMethod === "COD") {
      if (order.otpCode !== otp) {
        return NextResponse.json({ error: "Incorrect delivery OTP" }, { status: 400 });
      }
      if (!cashCollected) {
        return NextResponse.json(
          { error: "Confirm cash has been collected before marking this order delivered." },
          { status: 400 }
        );
      }
    }
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      paymentStatus: status === "DELIVERED" ? "PAID" : undefined,
      statusHistory: { create: { status, note } },
    },
    include: { customer: true, items: { include: { product: true } } },
  });

  // SMS — best-effort, skipped if the customer has no phone on file
  const smsFn = CUSTOMER_SMS_MESSAGES[status];
  if (smsFn && updated.customer.phone) {
    sendSms(updated.customer.phone, smsFn(updated.orderNumber)).catch(() => {});
  }

  // Email — best-effort, skipped if the customer has no email on file
  if (updated.customer.email) {
    const orderForEmail = {
      orderNumber: updated.orderNumber,
      total: Number(updated.total),
      items: updated.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
      addressSnapshot: updated.addressSnapshot,
      paymentMethod: updated.paymentMethod,
      otpCode: updated.otpCode,
    };

    if (status === "CONFIRMED") {
      const { subject, html } = orderConfirmedEmail(orderForEmail);
      sendEmail(updated.customer.email, subject, html).catch((err) => console.error("[email] order-confirmed send failed:", err));
    } else if (status === "DELIVERED") {
      const { subject, html } = orderDeliveredEmail(orderForEmail);
      sendEmail(updated.customer.email, subject, html).catch((err) => console.error("[email] order-delivered send failed:", err));
    }
  }

  return NextResponse.json(updated);
}
