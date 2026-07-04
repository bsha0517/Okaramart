/**
 * SMS provider abstraction for sending OTP codes.
 *
 * No SMS gateway is wired up yet — sendSms() currently just logs to the
 * console so you can develop/test the OTP flow locally. Before going live,
 * implement one of the common Pakistani SMS gateways here, for example:
 *   - Telesign, Twilio (international, works but pricier per-SMS in PK)
 *   - Local aggregators: Nexmo/Vonage, or Pakistani providers like
 *     itopup, Vneuron, or your telecom's bulk SMS API (Jazz/Telenor/Zong
 *     business portals often provide one)
 *
 * Swap the implementation in `sendSms` below — nothing else in the app
 * needs to change since callers only depend on this function's signature.
 */

export async function sendSms(phone: string, message: string): Promise<void> {
  if (process.env.SMS_PROVIDER === "console" || !process.env.SMS_PROVIDER) {
    // eslint-disable-next-line no-console
    console.log(`[SMS to ${phone}]: ${message}`);
    return;
  }

  // Example shape for a real provider — fill in once you pick one:
  // await axios.post(process.env.SMS_API_URL!, {
  //   to: phone,
  //   message,
  //   apiKey: process.env.SMS_API_KEY,
  // });

  throw new Error(`SMS_PROVIDER "${process.env.SMS_PROVIDER}" not yet implemented`);
}
