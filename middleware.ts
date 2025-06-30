import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define routes that require authentication
  const protectedRoutes = [
    "/donate",
    "/expense",
    "/secret",
    "/funds",
    "/dashboard/internal",
  ];

  const isProtected = protectedRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/donate/:path*",
    "/expense/:path*",
    "/secret/:path*",
    "/funds/:path*",
    "/dashboard/internal/:path*",
    "/dashboard/user/:path*",
  ],
};
