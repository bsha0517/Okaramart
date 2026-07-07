import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderStatusControl from "@/components/OrderStatusControl";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed", CONFIRMED: "Confirmed", PACKING: "Packing", PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled", RETURNED: "Returned",
};

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      rider: true,
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <a href="/admin/orders" className="text-canal text-sm font-medium mb-3 inline-block">← All orders</a>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-canal mb-1">{order.orderNumber}</h1>
          <p className="text-char/50 text-sm">
            {new Date(order.createdAt).toLocaleString()} · {order.customer.name} · {order.customer.phone ?? order.customer.email}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-canal/10 text-canal">
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-canal/10 rounded-xl p-4">
          <h2 className="font-semibold text-sm mb-2">Delivery address</h2>
          <p className="text-sm text-char/70">{order.addressSnapshot}</p>
          {order.rider && <p className="text-sm text-char/70 mt-2">Rider: {order.rider.name} ({order.rider.phone})</p>}
        </div>
        <div className="bg-white border border-canal/10 rounded-xl p-4">
          <h2 className="font-semibold text-sm mb-2">Payment</h2>
          <p className="text-sm text-char/70">{order.paymentMethod} · {order.paymentStatus}</p>
          {order.notes && <p className="text-sm text-char/70 mt-2">Note: {order.notes}</p>}
        </div>
      </div>

      <div className="bg-white border border-canal/10 rounded-xl p-4 mb-5">
        <h2 className="font-semibold text-sm mb-3">Items</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity} × {item.product.name}</span>
              <span>Rs {(item.quantity * Number(item.unitPrice)).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-canal/10 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-char/60"><span>Subtotal</span><span>Rs {Number(order.subtotal).toFixed(0)}</span></div>
          <div className="flex justify-between text-char/60"><span>Delivery fee</span><span>Rs {Number(order.deliveryFee).toFixed(0)}</span></div>
          {Number(order.smallOrderFee) > 0 && (
            <div className="flex justify-between text-char/60"><span>Small order fee</span><span>Rs {Number(order.smallOrderFee).toFixed(0)}</span></div>
          )}
          {Number(order.platformFee) > 0 && (
            <div className="flex justify-between text-char/60"><span>Platform fee</span><span>Rs {Number(order.platformFee).toFixed(0)}</span></div>
          )}
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-canal"><span>Discount</span><span>−Rs {Number(order.discount).toFixed(0)}</span></div>
          )}
          <div className="flex justify-between font-semibold text-char pt-1"><span>Total</span><span>Rs {Number(order.total).toFixed(0)}</span></div>
        </div>
      </div>

      <div className="bg-white border border-canal/10 rounded-xl p-4 mb-5">
        <h2 className="font-semibold text-sm mb-3">Update status</h2>
        <OrderStatusControl
          orderId={order.id}
          currentStatus={order.status}
          paymentMethod={order.paymentMethod}
        />
      </div>

      <div className="bg-white border border-canal/10 rounded-xl p-4">
        <h2 className="font-semibold text-sm mb-3">History</h2>
        <div className="space-y-2 text-sm">
          {order.statusHistory.map((h) => (
            <div key={h.id} className="flex justify-between text-char/60">
              <span>{STATUS_LABEL[h.status]}{h.note ? ` — ${h.note}` : ""}</span>
              <span>{new Date(h.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
