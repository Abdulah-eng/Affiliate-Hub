import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect unauthenticated users away from protected routes
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Only ADMIN or CSR can access /admin
    if (
      pathname.startsWith("/admin") &&
      token.role !== "ADMIN" &&
      token.role !== "CSR"
    ) {
      return NextResponse.redirect(new URL("/agent", req.url));
    }

    // Only AGENT can access /agent
    if (pathname.startsWith("/agent") && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ["/agent/:path*", "/admin/:path*"]
};
