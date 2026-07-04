import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Routes publiques
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/oauth-callback",
  ];

  // Routes protégées
  const protectedRoutes = [
    "/community",
    "/dashboard",
    "/profile",
    "/settings",
    "/messages",
    "/notifications",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Exclure les routes API et les fichiers statiques
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Log de debug (optionnel)
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Path: ${pathname}, Token: ${!!token}`);
  }

  // Route publique + token -> rediriger vers community
  if (isPublicRoute && token) {
    if (pathname === "/oauth-callback") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/community", request.url));
  }

  // Route protégée + pas de token -> rediriger vers login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Route protégée + token = on laisse passer
  // La validation du token se fait côté client via React Query
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/community/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/oauth-callback",
  ],
};

export default middleware;
