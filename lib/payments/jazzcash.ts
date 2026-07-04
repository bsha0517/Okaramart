import crypto from "crypto";
import type { PaymentProvider, PaymentInitResult } from "./types";

/**
 * JazzCash Hosted Checkout (HC) integration.
 * Docs: JazzCash provides a "Payment Page" (redirect) API — merchant posts
 * signed fields to their gateway, user completes payment on JazzCash's page,
 * then JazzCash redirects back to JAZZCASH_RETURN_URL with a signed response.
 *
 * You MUST get real MERCHANT_ID / PASSWORD / HASH_KEY from JazzCash business
 * onboarding before this works. Sandbox credentials are provided during
 * their integration testing phase.
 */

const isProd = process.env.JAZZCASH_ENV === "production";
const BASE_URL = isProd
  ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
  : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

function generateSecureHash(fields: Record<string, string>, hashKey: string) {
  // JazzCash requires fields sorted alphabetically by key, concatenated with '&',
  // prefixed with the integrity salt (hash key), then HMAC-SHA256.
  const sortedKeys = Object.keys(fields).sort();
  const concatenated = sortedKeys.map((k) => fields[k]).join("&");
  const stringToHash = `${hashKey}&${concatenated}`;
  return crypto.createHmac("sha256", hashKey).update(stringToHash).digest("hex");
}

export const jazzCashProvider: PaymentProvider = {
  async initiate({ orderId, orderNumber, amountPkr, customerPhone }): Promise<PaymentInitResult> {
    const merchantId = process.env.JAZZCASH_MERCHANT_ID!;
    const password = process.env.JAZZCASH_PASSWORD!;
    const hashKey = process.env.JAZZCASH_HASH_KEY!;
    const returnUrl = process.env.JAZZCASH_RETURN_URL!;

    const now = new Date();
    const txnDateTime = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14); // yyyyMMddHHmmss
    const expiry = new Date(now.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    // Amount must be in paisa (multiply by 100), no decimals
    const amountPaisa = Math.round(amountPkr * 100).toString();

    const fields: Record<string, string> = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: orderNumber,
      pp_Amount: amountPaisa,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: orderId,
      pp_Description: `Okara Mart order ${orderNumber}`,
      pp_TxnExpiryDateTime: expiry,
      pp_ReturnURL: returnUrl,
      pp_MobileNumber: customerPhone.replace(/\D/g, ""),
    };

    const secureHash = generateSecureHash(fields, hashKey);

    return {
      type: "redirect",
      url: BASE_URL,
      formFields: { ...fields, pp_SecureHash: secureHash },
    };
  },

  async verifyCallback(payload) {
    const hashKey = process.env.JAZZCASH_HASH_KEY!;
    const receivedHash = payload.pp_SecureHash;
    const fieldsForHash = { ...payload };
    delete fieldsForHash.pp_SecureHash;

    const expectedHash = generateSecureHash(fieldsForHash, hashKey);
    const validSignature = expectedHash === receivedHash;

    return {
      success: validSignature && payload.pp_ResponseCode === "000",
      orderNumber: payload.pp_TxnRefNo,
      providerTxnId: payload.pp_TxnRefNo,
      raw: payload,
    };
  },
};
