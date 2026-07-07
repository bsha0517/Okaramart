/**
 * Plain, simple HTML email templates — kept in one place so the branding
 * and layout stay consistent across all four order-lifecycle emails.
 */

type OrderForEmail = {
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
  addressSnapshot: string;
  paymentMethod: string;
  otpCode?: string | null;
};

function wrapper(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1A1A1A;">
    <h1 style="color: #0F3D3E; font-size: 22px; margin-bottom: 4px;">Okara Mart</h1>
    <h2 style="font-size: 16px; margin-top: 0; color: #1A1A1A;">${title}</h2>
    ${bodyHtml}
    <p style="font-size: 12px; color: #999; margin-top: 32px;">
      Okara Mart — serving Okara city only.
    </p>
  </div>`;
}

function itemsTable(items: OrderForEmail["items"]): string {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding: 6px 0; font-size: 14px;">${i.quantity} × ${i.name}</td>
        <td style="padding: 6px 0; font-size: 14px; text-align: right;">Rs ${(i.quantity * i.unitPrice).toFixed(0)}</td>
      </tr>`
    )
    .join("");
  return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">${rows}</table>`;
}

export function orderPlacedEmail(order: OrderForEmail): { subject: string; html: string } {
  return {
    subject: `Order ${order.orderNumber} placed — Okara Mart`,
    html: wrapper(
      "Thanks for your order!",
      `<p style="font-size: 14px;">We've received your order <strong>${order.orderNumber}</strong> and it's being prepared.</p>
       ${itemsTable(order.items)}
       <p style="font-size: 14px;"><strong>Total: Rs ${order.total.toFixed(0)}</strong></p>
       <p style="font-size: 14px; color: #555;">Delivering to: ${order.addressSnapshot}</p>
       <p style="font-size: 14px; color: #555;">Payment: ${order.paymentMethod}</p>`
    ),
  };
}

export function newOrderOpsEmail(order: OrderForEmail & { customerName: string; customerPhone?: string | null }): { subject: string; html: string } {
  return {
    subject: `New order ${order.orderNumber} — Rs ${order.total.toFixed(0)}`,
    html: wrapper(
      "New order received",
      `<p style="font-size: 14px;"><strong>${order.customerName}</strong>${order.customerPhone ? ` · ${order.customerPhone}` : ""}</p>
       ${itemsTable(order.items)}
       <p style="font-size: 14px;"><strong>Total: Rs ${order.total.toFixed(0)}</strong></p>
       <p style="font-size: 14px; color: #555;">Delivering to: ${order.addressSnapshot}</p>
       <p style="font-size: 14px; color: #555;">Payment: ${order.paymentMethod}</p>`
    ),
  };
}

export function orderConfirmedEmail(order: OrderForEmail): { subject: string; html: string } {
  const otpBlock = order.otpCode
    ? `<div style="background: #F6F1E4; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
         <p style="font-size: 13px; color: #555; margin: 0 0 6px;">Give this code to your rider once you've handed over the cash payment:</p>
         <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #0F3D3E; margin: 0;">${order.otpCode}</p>
       </div>`
    : "";
  return {
    subject: `Order ${order.orderNumber} confirmed — Okara Mart`,
    html: wrapper(
      "Your order is confirmed",
      `<p style="font-size: 14px;">Order <strong>${order.orderNumber}</strong> is confirmed and being packed for delivery.</p>
       ${otpBlock}
       <p style="font-size: 14px; color: #555;">Delivering to: ${order.addressSnapshot}</p>`
    ),
  };
}

export function orderDeliveredEmail(order: OrderForEmail): { subject: string; html: string } {
  return {
    subject: `Order ${order.orderNumber} delivered — Okara Mart`,
    html: wrapper(
      "Delivered!",
      `<p style="font-size: 14px;">Order <strong>${order.orderNumber}</strong> has been delivered. Thanks for shopping with Okara Mart!</p>`
    ),
  };
}
