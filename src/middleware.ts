import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (req.nextUrl.pathname.startsWith("/login")) return true;
        return token !== null;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/pipeline/:path*", "/ai-insights/:path*", "/analytics/:path*", "/sequences/:path*", "/billing/:path*", "/settings/:path*", "/login"],
};
