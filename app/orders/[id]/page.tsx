import { prisma } from "@/lib/prisma";
import { getUnifiedCustomerSession } from "@/lib/customerSession";
import { notFound, redirect } from "next/navigation";
import CancelOrderButton from "@/components/CancelOrderButton";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1"; // match your Supabase region

const STATUS_STEPS = ["PLACED", "CONFIRMED", "PACKING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];
const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PACKING: "Packing",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};
const CANCELLABLE_STATUSES = ["PLACED", "CONFIRMED", "PACKING", "PACKED"];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string };
}) {
  const session = await getUnifiedCustomerSession();
  if (!session) redirect(`/login`);

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.customerId !== session.userId) notFound();

  const isCancelled = order.status === "CANCELLED";
  const isReturned = order.status === "RETURNED";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {searchParams.paid === "false" && (
        <p className="bg-brick/5 border border-brick/20 text-brick text-sm rounded-lg px-4 py-3 mb-6">
          Payment didn't go through for this order. Contact support if you were charged.
        </p>
      )}
      {searchParams.paid === "true" && (
        <p className="bg-canal/5 border border-canal/20 text-canal text-sm rounded-lg px-4 py-3 mb-6">
          Payment confirmed — thanks for your order!
        </p>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-canal mb-1">{order.orderNumber}</h1>
          <p className="text-char/50 text-sm">
            Placed {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          isCancelled || isReturned ? "bg-brick/10 text-brick" : "bg-canal/10 text-canal"
        }`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Tracking timeline — hidden for cancelled/returned since the linear
          "placed → delivered" steps don't apply anymore */}
      {!isCancelled && !isReturned && (
        <div className="bg-white border border-canal/10 rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-char mb-4">Tracking</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStepIndex ? "bg-canal text-husk" : "bg-canal/10 text-char/30"
                  }`}>
                    {i < currentStepIndex ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 text-center max-w-[64px] ${
                    i <= currentStepIndex ? "text-char font-medium" : "text-char/30"
                  }`}>
                    {STATUS_LABEL[step]}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 ${i < currentStepIndex ? "bg-canal" : "bg-canal/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items ordered */}
      <div className="bg-white border border-canal/10 rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-char mb-3">Items ordered</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-char/50 text-xs">{item.quantity} × Rs {Number(item.unitPrice).toFixed(0)}</p>
              </div>
              <span className="font-medium">Rs {(item.quantity * Number(item.unitPrice)).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-canal/10 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-char/60">
            <span>Subtotal</span>
            <span>Rs {Number(order.subtotal).toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-char/60">
            <span>Delivery fee</span>
            <span>Rs {Number(order.deliveryFee).toFixed(0)}</span>
          </div>
          {Number(order.smallOrderFee) > 0 && (
            <div className="flex justify-between text-char/60">
              <span>Small order fee</span>
              <span>Rs {Number(order.smallOrderFee).toFixed(0)}</span>
            </div>
          )}
          {Number(order.platformFee) > 0 && (
            <div className="flex justify-between text-char/60">
              <span>Platform fee</span>
              <span>Rs {Number(order.platformFee).toFixed(0)}</span>
            </div>
          )}
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-canal">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>−Rs {Number(order.discount).toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-char text-base pt-1">
            <span>Total</span>
            <span>Rs {Number(order.total).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Delivery + payment details */}
      <div className="bg-white border border-canal/10 rounded-2xl p-5 mb-5 text-sm">
        <h2 className="font-semibold text-char mb-2">Delivery details</h2>
        <p className="text-char/70 mb-3">{order.addressSnapshot}</p>
        <h2 className="font-semibold text-char mb-2">Payment</h2>
        <p className="text-char/70">
          {order.paymentMethod} · {order.paymentStatus}
        </p>
      </div>

      {order.paymentMethod === "COD" && order.otpCode && !isCancelled && !isReturned && order.status !== "DELIVERED" && (
        <div className="bg-wheat/15 border border-wheat/40 rounded-2xl p-5 mb-5 text-center">
          <p className="text-sm text-char/70 mb-1">Give this code to your rider once you've handed over the cash</p>
          <p className="text-3xl font-bold tracking-[0.3em] text-canal">{order.otpCode}</p>
        </div>
      )}

      {canCancel && <CancelOrderButton orderId={order.id} />}
      {!canCancel && !isCancelled && !isReturned && (
        <p className="text-xs text-char/40 text-center">
          This order has already shipped and can no longer be cancelled.
        </p>
      )}
    </div>
  );
}
