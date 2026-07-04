import { NextRequest, NextResponse } from "next/server";
import { easyPaisaProvider } from "@/lib/payments/easypaisa";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload: Record<string, string> = {};
  form.forEach((v, k) => (payload[k] = v.toString()));

  const result = await easyPaisaProvider.verifyCallback(payload);

  const order = await prisma.order.findUnique({ where: { orderNumber: result.orderNumber } });
  if (!order) {
    return NextResponse.redirect(new URL("/checkout/error?reason=order_not_found", req.url));
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: result.success ? "PAID" : "FAILED",
      providerTxnId: result.providerTxnId,
      providerRawResponse: result.raw,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: result.success ? "PAID" : "FAILED",
      status: result.success ? "CONFIRMED" : "CANCELLED",
      statusHistory: {
        create: { status: result.success ? "CONFIRMED" : "CANCELLED", note: "EasyPaisa callback" },
      },
    },
  });

  return NextResponse.redirect(
    new URL(`/orders/${order.id}?paid=${result.success}`, req.url)
  );
}
