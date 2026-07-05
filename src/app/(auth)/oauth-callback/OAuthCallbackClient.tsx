/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function OAuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

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
      setErrorMessage("Token non trouve");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      return;
    }

    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 3600}`;

    const fetchUser = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const response = await fetch(`${apiUrl}/auth/oauth-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/community");
          }, 1500);
        } else {
          throw new Error(data.message || "Erreur de recuperation du profil");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Erreur lors de la connexion",
        );
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Leaf className="h-10 w-10 text-green-600" />
          </div>
        </div>

        {status === "loading" && (
          <>
            <div className="mb-4 flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Connexion en cours
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vous connectons a AgriPulse...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Connexion reussie !
            </h2>
            <p className="text-gray-600">
              Redirection vers votre espace communautaire...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Erreur de connexion
            </h2>
            <p className="mb-4 text-red-600">{errorMessage}</p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de connexion...
            </p>
          </>
        )}

        {status === "loading" && (
          <div className="mt-6 flex justify-center gap-1">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-green-400"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-green-400"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-green-400"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
