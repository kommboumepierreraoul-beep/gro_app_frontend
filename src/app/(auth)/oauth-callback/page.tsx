import { Suspense } from "react";
import { OAuthCallbackClient } from "./OAuthCallbackClient";

export const dynamic = "force-dynamic";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<OAuthCallbackFallback />}>
      <OAuthCallbackClient />
    </Suspense>
  );
}

function OAuthCallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-gray-600">
          Connexion en cours...
        </p>
      </div>
    </div>
  );
}
