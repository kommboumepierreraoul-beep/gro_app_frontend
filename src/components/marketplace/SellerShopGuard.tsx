"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

function parseShopResponse(data: unknown) {
  if (typeof data === "string") {
    const cleaned = data.replace(/^[^\{\[]+/, "");
    return JSON.parse(cleaned);
  }

  return data;
}

export function SellerShopGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["seller-shop-access"],
    queryFn: async () => {
      const response = await api.get("/my-shop/profile");
      const parsed = parseShopResponse(response.data) as {
        data?: { id?: number };
        id?: number;
      } | null;
      const shop = parsed?.data ?? parsed;

      if (!shop?.id) {
        throw new Error("NO_SHOP");
      }

      return shop;
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      router.replace("/create-shop");
    }
  }, [isError, router]);

  if (isLoading || isError || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm font-semibold text-[#72796e]">
          Vérification de votre boutique...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
