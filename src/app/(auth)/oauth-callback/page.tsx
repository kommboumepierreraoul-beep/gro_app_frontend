/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    // Gestion des erreurs
    if (error) {
      setStatus("error");
      setErrorMessage(decodeURIComponent(error));
      setTimeout(() => {
        router.push("/login?error=" + encodeURIComponent(error));
      }, 3000);
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("Token non trouvé");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      return;
    }

    // Sauvegarder le token dans un cookie
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 3600}`;

    // Récupérer les données utilisateur
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/auth/oauth-user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          // Rediriger vers la page community après 1.5s
          setTimeout(() => {
            router.push("/community");
          }, 1500);
        } else {
          throw new Error(data.message || "Erreur de récupération du profil");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Erreur lors de la connexion",
        );
        // Nettoyer le token invalide
        document.cookie = "auth_token=; path=/; max-age=0";
        setTimeout(() => {
          router.push(
            "/login?error=" + encodeURIComponent("Erreur de connexion"),
          );
        }, 3000);
      }
    };

    fetchUser();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Connexion en cours
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vous connectons à AgriPulse...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Connexion réussie !
            </h2>
            <p className="text-gray-600">
              Redirection vers votre espace communautaire...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Erreur de connexion
            </h2>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de connexion...
            </p>
          </>
        )}

        {/* Animation de chargement */}
        {status === "loading" && (
          <div className="mt-6 flex justify-center gap-1">
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
