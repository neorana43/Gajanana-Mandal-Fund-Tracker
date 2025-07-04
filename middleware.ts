import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 Redirect to /login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 👤 Get role from user_roles table
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = roleData?.role;

  // 🔒 Define admin-only routes
  const adminOnlyPaths = [
    "/dashboard/internal",
    "/funds",
    "/audit/allocations",
    "/users/manage",
    "/secret",
  ];

  const isAdminOnly = adminOnlyPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  // ❌ Redirect volunteers away from admin routes
  if (isAdminOnly && userRole !== "admin") {
    return NextResponse.redirect(new URL("/denied", req.url));
  }

  const url = req.nextUrl.clone();

  // TODO: Replace this with real logic to get the user's current mandal slug
  // For example, from session, cookie, or database
  const userMandalSlug = "your-mandal-slug"; // <-- Replace with real logic

  if (url.pathname === "/dashboard") {
    url.pathname = `/mandal/${userMandalSlug}/dashboard`;
    return NextResponse.redirect(url);
  }
  if (url.pathname === "/donate/list") {
    url.pathname = `/mandal/${userMandalSlug}/donate/list`;
    return NextResponse.redirect(url);
  }
  // Add more legacy routes as needed

  return res;
}

export const config = {
  matcher: [
    "/dashboard/internal/:path*",
    "/dashboard/user/:path*",
    "/funds/:path*",
    "/audit/allocations",
    "/users/manage",
    "/secret/:path*",
    "/donate/:path*",
    "/expense/:path*",
  ],
};
