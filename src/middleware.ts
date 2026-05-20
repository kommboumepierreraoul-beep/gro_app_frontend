import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  /*
    |--------------------------------------------------------------------------
    | 1. RECUPERER LES INFOS
    |--------------------------------------------------------------------------
    */

  const token = request.cookies.get("token")?.value;

  const pathname = request.nextUrl.pathname;

  /*
    |--------------------------------------------------------------------------
    | 2. DEFINIR LES ROUTES
    |--------------------------------------------------------------------------
    */

  const publicRoutes = ["/login", "/register", "/forgot-password"];

  const protectedRoutes = ["/dashboard", "/profile", "/settings"];

  /*
    |--------------------------------------------------------------------------
    | 3. VERIFIER LE TYPE DE ROUTE
    |--------------------------------------------------------------------------
    */

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  /*
    |--------------------------------------------------------------------------
    | 4. CAS UTILISATEUR NON CONNECTE
    |--------------------------------------------------------------------------
    */

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /*
    |--------------------------------------------------------------------------
    | 5. CAS UTILISATEUR CONNECTE
    |--------------------------------------------------------------------------
    */

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  /*
    |--------------------------------------------------------------------------
    | 6. VALIDATION OPTIONNELLE DU TOKEN
    |--------------------------------------------------------------------------
    */

  // Exemple:
  // appeler Laravel pour verifier le token

  /*
    |--------------------------------------------------------------------------
    | 7. CONTINUER
    |--------------------------------------------------------------------------
    */

  return NextResponse.next();
}

/*
|--------------------------------------------------------------------------
| 8. MATCHER
|--------------------------------------------------------------------------
*/

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
