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

function SellerGuardSkeleton() {
  return (
    <div className="min-h-[60vh] rounded-2xl border border-[#c2c9bb]/35 bg-white/75 p-5">
      <div className="mb-5 h-8 w-56 animate-pulse rounded bg-[#dce2d8]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#c2c9bb]/30 bg-white p-4"
          >
            <div className="h-32 animate-pulse rounded-xl bg-[#e7e9e1]" />
            <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-[#dce2d8]" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-[#e7e9e1]" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-[#e7e9e1]" />
          </div>
        ))}
      </div>
    </div>
  );
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
    return <SellerGuardSkeleton />;
  }

  return <>{children}</>;
}
