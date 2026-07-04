import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  /*
    |--------------------------------------------------------------------------
    | 1. RECUPERER LES INFOS
    |--------------------------------------------------------------------------
    */

  const token = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  /*
    |--------------------------------------------------------------------------
    | 2. DEFINIR LES ROUTES
    |--------------------------------------------------------------------------
    */

  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/oauth-callback",
  ];

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

  /*
    |--------------------------------------------------------------------------
    | 3. LOG DE DEBUG (à supprimer en production)
    |--------------------------------------------------------------------------
    */

  console.log(`[Middleware] Path: ${pathname}, Token: ${!!token}`);

  /*
    |--------------------------------------------------------------------------
    | 4. GESTION DES ROUTES PUBLIQUES
    |--------------------------------------------------------------------------
    */

  // Si route publique et token présent -> rediriger vers community
  if (isPublicRoute && token) {
    // Ne pas rediriger depuis oauth-callback
    if (pathname === "/oauth-callback") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/community", request.url));
  }

  /*
    |--------------------------------------------------------------------------
    | 5. GESTION DES ROUTES PROTÉGÉES
    |--------------------------------------------------------------------------
    */

  // Si route protégée et pas de token -> rediriger vers login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /*
    |--------------------------------------------------------------------------
    | 6. VALIDATION OPTIONNELLE DU TOKEN (SEULEMENT SUR LES ROUTES PROTÉGÉES)
    |--------------------------------------------------------------------------
    */

  // ✅ UNIQUEMENT si token présent ET route protégée
  if (token && isProtectedRoute) {
    try {
      // Vérifier le token avec le backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const verifyResponse = await fetch(`${apiUrl}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        // ⚠️ Important: Ne pas attendre trop longtemps
        signal: AbortSignal.timeout(5000),
      });

      // Si le token est invalide (401 ou 403)
      if (verifyResponse.status === 401 || verifyResponse.status === 403) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth_token");
        return response;
      }

      // Si le token est valide, continuer
      if (verifyResponse.ok) {
        return NextResponse.next();
      }

      // Autres erreurs (500, etc.) - on laisse passer mais on log
      console.error(
        `[Middleware] Token validation error: ${verifyResponse.status}`,
      );
    } catch (error) {
      // En cas d'erreur réseau, on laisse passer
      // Le backend fera la vérification à la prochaine requête API
      console.error(
        "[Middleware] Network error during token validation:",
        error,
      );
      // ⚠️ Important: Ne pas rediriger en cas d'erreur réseau
      // pour éviter les boucles de redirection
    }
  }

  /*
    |--------------------------------------------------------------------------
    | 7. CONTINUER
    |--------------------------------------------------------------------------
    */

  return NextResponse.next();
}

/*
|--------------------------------------------------------------------------
| 8. CONFIGURATION DU MATCHER
|--------------------------------------------------------------------------
*/

export const config = {
  matcher: [
    // Routes protégées
    "/community/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/notifications/:path*",

    // Routes publiques
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/oauth-callback",
  ],
};

export default middleware;
