// middleware.ts
// Next.js Edge Middleware – protects all non-public routes.
// Runs before every request, keeping auth checks at the network edge.

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect authenticated users away from auth pages
    if (token && (pathname.startsWith("/auth/") || pathname === "/")) {
      // Redirect to first workspace from token (handled client-side after redirect)
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to allow the middleware function to run; false = redirect to signIn
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow public paths
        const publicPaths = [
          "/auth/login",
          "/auth/register",
          "/auth/error",
          "/invite/",
          "/api/auth/",
          "/api/register",
          "/api/invites/",
        ];

        if (publicPaths.some((p) => pathname.startsWith(p))) return true;

        // Require auth for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
