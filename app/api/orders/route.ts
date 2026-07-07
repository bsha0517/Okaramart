import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { getUnifiedCustomerSession } from "@/lib/customerSession";
import { calculateOrderFees } from "@/lib/fees";
import { sendEmail, sendOperationsEmail } from "@/lib/email";
import { orderPlacedEmail, newOrderOpsEmail } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const CreateOrderSchema = z.object({
  addressId: z.string(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().min(1) })),
  paymentMethod: z.enum(["JAZZCASH", "EASYPAISA", "COD"]),
  couponCode: z.string().optional(),
  deliverySlot: z.string().optional(),
  notes: z.string().optional(),
  // Needed for JazzCash/EasyPaisa when the account (e.g. Google/Facebook
  // signup) has no phone on file — falls back to the account's phone if set.
  payerPhone: z.string().regex(/^03\d{9}$/, "Enter a valid mobile number, e.g. 03001234567").optional(),
});

function generateOrderNumber() {
  return `OKM-${Math.floor(10000 + Math.random() * 90000)}`;
}

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: NextRequest) {
  const session = await getUnifiedCustomerSession();
  if (!session) return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  const customerId = session.userId;

  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || "Please check your order details";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const { addressId, items, paymentMethod, couponCode, deliverySlot, notes, payerPhone } = parsed.data;

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== customerId) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  // Delivery fee by zone (Okara-specific areas)
  const zone = await prisma.deliveryZone.findFirst({
    where: { areaName: address.area, isActive: true },
  });
  const deliveryFee = zone ? Number(zone.deliveryFee) : 99; // default fee if area not mapped

  // Price + stock check happens server-side — never trust client-sent prices
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  let subtotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: `Product unavailable: ${item.productId}` }, { status: 400 });
    }
    if (product.stockQty < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}. Only ${product.stockQty} left.` },
        { status: 409 }
      );
    }
    subtotal += Number(product.price) * item.quantity;
  }

  let discount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && subtotal >= Number(coupon.minOrderValue)) {
      discount =
        coupon.discountType === "PERCENT"
          ? (subtotal * Number(coupon.discountValue)) / 100
          : Number(coupon.discountValue);
    }
  }

  const { smallOrderFee, platformFee } = calculateOrderFees(subtotal);
  const total = Math.max(subtotal + deliveryFee + smallOrderFee + platformFee - discount, 0);
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        addressId,
        addressSnapshot: `${address.addressLine}, ${address.area}, Okara`,
        paymentMethod,
        subtotal,
        deliveryFee,
        smallOrderFee,
        platformFee,
        discount,
        total,
        couponCode,
        deliverySlot: deliverySlot ?? "ASAP",
        notes,
        otpCode: paymentMethod === "COD" ? generateOtp() : null,
        items: {
          create: items.map((i) => {
            const product = products.find((p) => p.id === i.productId)!;
            return {
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: product.price,
            };
          }),
        },
        statusHistory: { create: { status: "PLACED" } },
      },
      include: { items: true },
    });

    // Decrement stock atomically
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }

    return created;
  });

  // Kick off payment
  const provider = getPaymentProvider(paymentMethod);
  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  const paymentResult = await provider.initiate({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountPkr: total,
    customerPhone: payerPhone || customer?.phone || "",
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: paymentMethod,
      amount: total,
      status: paymentMethod === "COD" ? "PENDING" : "PENDING",
    },
  });

  // Best-effort — email delivery issues shouldn't fail order placement.
  const emailItems = order.items.map((oi) => ({
    name: products.find((p) => p.id === oi.productId)?.name ?? "Item",
    quantity: oi.quantity,
    unitPrice: Number(oi.unitPrice),
  }));
  const orderForEmail = {
    orderNumber: order.orderNumber,
    total: Number(order.total),
    items: emailItems,
    addressSnapshot: order.addressSnapshot,
    paymentMethod: order.paymentMethod,
  };

  if (customer?.email) {
    const { subject, html } = orderPlacedEmail(orderForEmail);
    sendEmail(customer.email, subject, html).catch(() => {});
  }
  const opsTemplate = newOrderOpsEmail({
    ...orderForEmail,
    customerName: customer?.name ?? "Customer",
    customerPhone: customer?.phone,
  });
  sendOperationsEmail(opsTemplate.subject, opsTemplate.html).catch(() => {});

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    total,
    payment: paymentResult,
  });
}
