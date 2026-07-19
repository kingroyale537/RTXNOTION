// middleware.ts
// Next.js Edge Middleware – protects all non-public routes.
// Runs before every request, keeping auth checks at the network edge.

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();
let lastCleanup = Date.now();

function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  });
  lastCleanup = now;
}

function isRateLimited(ip: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const info = rateLimitMap.get(ip);

  if (!info) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > info.resetTime) {
    info.count = 1;
    info.resetTime = now + windowMs;
    return false;
  }

  info.count += 1;
  return info.count > limit;
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rate limit public submission endpoints to 5 requests per minute per IP
    if (pathname === "/api/waitlist" || pathname === "/api/register") {
      const ip = req.ip || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1";
      cleanupRateLimitMap();
      if (isRateLimited(ip, 5, 60 * 1000)) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Redirect authenticated users away from auth pages
    if (token && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
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
          "/login",
          "/register",
          "/error",
          "/invite/",
          "/api/auth/",
          "/api/register",
          "/api/invites/",
          "/waitlist",
          "/api/waitlist",
          "/public/pages/",
        ];

        if (pathname === "/") return true;
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
