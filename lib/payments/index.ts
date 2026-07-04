import type { PaymentProvider } from "./types";
import { jazzCashProvider } from "./jazzcash";
import { easyPaisaProvider } from "./easypaisa";

const codProvider: PaymentProvider = {
  async initiate() {
    // No gateway involved — order is confirmed immediately,
    // payment is collected by the rider on delivery.
    return { type: "cod_confirmed" };
  },
  async verifyCallback() {
    throw new Error("COD has no callback — use OTP confirmation on delivery instead.");
  },
};

export function getPaymentProvider(method: "JAZZCASH" | "EASYPAISA" | "COD"): PaymentProvider {
  switch (method) {
    case "JAZZCASH":
      return jazzCashProvider;
    case "EASYPAISA":
      return easyPaisaProvider;
    case "COD":
      return codProvider;
  }
}
