"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";

type CurrentUser = {
  role?: string;
  is_admin?: boolean;
};

function AdminGuardSkeleton() {
  return (
    <div className="min-h-[60vh] rounded-2xl border border-[#c2c9bb]/35 bg-white/75 p-5">
      <div className="mb-5 h-8 w-64 animate-pulse rounded bg-[#dce2d8]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#c2c9bb]/30 bg-white p-4"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-[#eaf3de]" />
            <div className="mt-4 h-6 w-20 animate-pulse rounded bg-[#dce2d8]" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-[#e7e9e1]" />
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3 rounded-2xl border border-[#c2c9bb]/25 bg-white p-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-[#e7e9e1]" />
            <div className="flex-1">
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#dce2d8]" />
              <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-[#e7e9e1]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-access"],
    queryFn: async () => {
      const response = await api.get("/auth/profile");
      const user = (
        response.data?.user ??
        response.data?.data ??
        response.data
      ) as CurrentUser;

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
    return <AdminGuardSkeleton />;
  }

  return <>{children}</>;
}
