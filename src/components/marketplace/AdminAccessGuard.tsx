"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

type CurrentUser = {
  role?: string;
  is_admin?: boolean;
};

export function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-access"],
    queryFn: async () => {
      const response = await api.get("/user");
      const user = (response.data?.data ?? response.data) as CurrentUser;

      if (user?.role !== "admin" && user?.is_admin !== true) {
        throw new Error("NOT_ADMIN");
      }

      return user;
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      router.replace("/marketplace");
    }
  }, [isError, router]);

  if (isLoading || isError || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm font-semibold text-[#72796e]">
          Vérification de l&apos;accès administrateur...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
