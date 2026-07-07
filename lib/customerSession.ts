import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type CustomerSession = { userId: string; phone: string; role: string };

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
