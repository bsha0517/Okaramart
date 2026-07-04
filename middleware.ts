import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as any)?.role;
    const path = req.nextUrl.pathname;

    // Fine-grained: only SUPER_ADMIN and MANAGER can manage users/settings
    if (path.startsWith("/admin/users") && !["SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (path.startsWith("/admin/inventory") && !["SUPER_ADMIN", "MANAGER"].includes(role)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (path.startsWith("/rider") && !["RIDER", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) =>
        !!token && ["SUPER_ADMIN", "MANAGER", "PACKER", "RIDER"].includes((token as any).role),
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/rider/:path*"],
};
