/**
 * Fee rules — change these two numbers and every part of the app
 * (cart nudge, checkout breakdown, order creation) stays in sync.
 */
export const SMALL_ORDER_THRESHOLD = 500; // Rs — subtotal below this incurs the small-order fee
export const SMALL_ORDER_FEE = 80; // Rs
export const PLATFORM_FEE = 10; // Rs — flat, on every order

export function calculateOrderFees(subtotal: number) {
  const smallOrderFee = subtotal < SMALL_ORDER_THRESHOLD ? SMALL_ORDER_FEE : 0;
  const platformFee = PLATFORM_FEE;
  return { smallOrderFee, platformFee };
}

export function amountToAvoidSmallOrderFee(subtotal: number): number {
  return Math.max(SMALL_ORDER_THRESHOLD - subtotal, 0);
}
