import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type CustomerSession = { userId: string; phone?: string; role: string };

/** Password-based login (phone + password) — our own JWT cookie. */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  const token = cookies().get("customer_session")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

/**
 * Checks BOTH login systems: our own password-login cookie, and a
 * NextAuth session from Google/Facebook. Use this everywhere a customer
 * needs to be identified (checkout, addresses, account page) so it works
 * no matter which method they signed in with.
 */
export async function getUnifiedCustomerSession(): Promise<CustomerSession | null> {
  const passwordSession = await getCustomerSession();
  if (passwordSession) return passwordSession;

  const nextAuthSession = await getServerSession(authOptions);
  const user = nextAuthSession?.user as any;
  if (user?.role === "CUSTOMER" && user?.id) {
    return { userId: user.id, phone: user.phone ?? undefined, role: "CUSTOMER" };
  }
  return null;
}
