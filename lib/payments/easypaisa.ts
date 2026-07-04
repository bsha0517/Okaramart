import crypto from "crypto";
import type { PaymentProvider, PaymentInitResult } from "./types";

/**
 * EasyPaisa Hosted Checkout integration (Telenor Microfinance Bank).
 * Similar redirect-based flow to JazzCash: merchant posts signed fields,
 * customer pays on EasyPaisa's page, EasyPaisa redirects back with a signed
 * response to EASYPAISA_RETURN_URL.
 *
 * Real STORE_ID / HASH_KEY come from EasyPaisa merchant onboarding.
 */

const isProd = process.env.EASYPAISA_ENV === "production";
const BASE_URL = isProd
  ? "https://easypay.easypaisa.com.pk/easypay/Index.jsf"
  : "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf";

function generateHash(payload: Record<string, string>, hashKey: string) {
  const sortedKeys = Object.keys(payload).sort();
  const concatenated = sortedKeys.map((k) => `${k}=${payload[k]}`).join("&");
  return crypto.createHmac("sha256", hashKey).update(concatenated).digest("hex");
}

export const easyPaisaProvider: PaymentProvider = {
  async initiate({ orderId, orderNumber, amountPkr, customerPhone }): Promise<PaymentInitResult> {
    const storeId = process.env.EASYPAISA_STORE_ID!;
    const hashKey = process.env.EASYPAISA_HASH_KEY!;
    const returnUrl = process.env.EASYPAISA_RETURN_URL!;

    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    const fields: Record<string, string> = {
      storeId,
      amount: amountPkr.toFixed(2),
      postBackURL: returnUrl,
      orderRefNum: orderNumber,
      expiryDate,
      merchantHashedReq: "", // filled below
      autoRedirect: "1",
      paymentMethod: "MA_PAYMENT_METHOD", // mobile account
      emailAddr: "",
      mobileNum: customerPhone.replace(/\D/g, ""),
    };

    const { merchantHashedReq, ...toHash } = fields;
    const hash = generateHash(toHash, hashKey);

    return {
      type: "redirect",
      url: BASE_URL,
      formFields: { ...toHash, merchantHashedReq: hash },
    };
  },

  async verifyCallback(payload) {
    const hashKey = process.env.EASYPAISA_HASH_KEY!;
    const receivedHash = payload.merchantHashedReq;
    const { merchantHashedReq, ...rest } = payload;
    const expectedHash = generateHash(rest, hashKey);

    return {
      success: expectedHash === receivedHash && payload.status === "0000",
      orderNumber: payload.orderRefNum,
      providerTxnId: payload.transactionId,
      raw: payload,
    };
  },
};
