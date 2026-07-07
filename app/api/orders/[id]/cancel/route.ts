import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUnifiedCustomerSession } from "@/lib/customerSession";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

// Once an order is out for delivery, a rider is already carrying it —
// too late to cancel. Anything before that is still fair game.
const CANCELLABLE_STATUSES = ["PLACED", "CONFIRMED", "PACKING", "PACKED"];

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUnifiedCustomerSession();
  if (!session) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order || order.customerId !== session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { error: "This order has already shipped and can no longer be cancelled." },
      { status: 409 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Give the stock back
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        statusHistory: { create: { status: "CANCELLED", note: "Cancelled by customer" } },
      },
    });
  });

  return NextResponse.json({ ok: true });
}
