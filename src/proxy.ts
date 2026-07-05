import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/new-password",
  "/verify-email",
  "/oauth-callback",
];

const protectedRoutes = [
  "/community",
  "/profile",
  "/settings",
  "/messages",
  "/notifications",
  "/users",
  "/search",
  "/missions",
  "/announcements",
  "/support",
  "/chat-ai",
  "/marketplace",
  "/orders",
  "/wallet",
  "/account",
  "/profile-market",
  "/my-shop",
  "/create-shop",
  "/shop-created",
  "/add-product",
  "/edit-product",
  "/vendor",
  "/seller",
  "/disputes",
  "/admin",
];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute && token) {
    if (pathname === "/oauth-callback") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/community", request.url));
  }

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/community/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/users/:path*",
    "/search/:path*",
    "/missions/:path*",
    "/announcements/:path*",
    "/support/:path*",
    "/chat-ai/:path*",
    "/marketplace/:path*",
    "/orders/:path*",
    "/wallet/:path*",
    "/account/:path*",
    "/profile-market/:path*",
    "/my-shop/:path*",
    "/create-shop/:path*",
    "/shop-created/:path*",
    "/add-product/:path*",
    "/edit-product/:path*",
    "/vendor/:path*",
    "/seller/:path*",
    "/disputes/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/new-password",
    "/verify-email",
    "/oauth-callback",
  ],
};
