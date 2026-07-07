import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/staff-login" },
  providers: [
    CredentialsProvider({
      name: "Phone & Password",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });
        if (!user || !user.passwordHash || !user.isActive) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, phone: user.phone, role: user.role };
      },
    }),
    // Free customer login — no per-signup SMS cost, unlike OTP.
    // Only used for customer-facing login (see app/login), never for
    // staff/admin — staff always uses phone+password via /staff-login.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials" && user) {
        // Staff/admin login — role comes straight from our own authorize()
        token.role = (user as any).role;
        token.id = (user as any).id;
      } else if (account && (account.provider === "google" || account.provider === "facebook")) {
        // OAuth customer login — find or create a matching Prisma User by
        // email, defaulting new signups to CUSTOMER. If an account with
        // this email already exists (e.g. a staff member), we keep their
        // existing role rather than downgrading them.
        const email = (user as any)?.email as string | undefined;
        if (email) {
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: { name: (user as any)?.name || "Customer", email, role: "CUSTOMER" },
            });
          }
          token.role = dbUser.role;
          token.id = dbUser.id;
          token.phone = dbUser.phone ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
};

/** Roles allowed into /admin/* — everything except plain CUSTOMER */
export const ADMIN_ROLES = ["SUPER_ADMIN", "MANAGER", "PACKER", "RIDER"];
