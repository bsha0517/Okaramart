export type PaymentInitResult =
  | { type: "redirect"; url: string; formFields?: Record<string, string> }
  | { type: "cod_confirmed" };

export interface PaymentProvider {
  /** Kick off a payment for an order. Returns a redirect (for wallets) or immediate confirmation (COD). */
  initiate(params: {
    orderId: string;
    orderNumber: string;
    amountPkr: number;
    customerPhone: string;
  }): Promise<PaymentInitResult>;

  /** Verify a callback/webhook from the provider. Must check hash/signature before trusting it. */
  verifyCallback(payload: Record<string, any>): Promise<{
    success: boolean;
    orderNumber: string;
    providerTxnId?: string;
    raw: Record<string, any>;
  }>;
}
