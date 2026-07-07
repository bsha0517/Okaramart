/**
 * Email sending abstraction. Defaults to logging to the console so you can
 * develop/test locally without an email account set up.
 *
 * Uses Resend (resend.com) via plain HTTP fetch — no extra npm package
 * needed. Resend has a generous free tier (3,000 emails/month) and is one
 * of the simplest providers to set up for a Next.js app. If you'd rather
 * use something else (SendGrid, Postmark, plain SMTP), swap the
 * implementation below — nothing else in the app needs to change since
 * callers only depend on this function's signature.
 */

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!to) return; // nothing to send to — e.g. a customer with no email on file

  if (!process.env.EMAIL_PROVIDER || process.env.EMAIL_PROVIDER === "console") {
    // eslint-disable-next-line no-console
    console.log(`[EMAIL to ${to}] ${subject}\n${html}`);
    return;
  }

  if (process.env.EMAIL_PROVIDER === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Okara Mart <orders@okaramart.pk>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      // eslint-disable-next-line no-console
      console.error(`[email] Resend API rejected send to ${to} (status ${res.status}): ${errorBody}`);
      throw new Error(`Resend email failed: ${errorBody}`);
    }
    return;
  }

  throw new Error(`EMAIL_PROVIDER "${process.env.EMAIL_PROVIDER}" not yet implemented`);
}

/** Sends to the operations team address (OPERATIONS_EMAIL env var) — a no-op if it isn't set. */
export async function sendOperationsEmail(subject: string, html: string): Promise<void> {
  const opsEmail = process.env.OPERATIONS_EMAIL;
  if (!opsEmail) return;
  await sendEmail(opsEmail, subject, html);
}
