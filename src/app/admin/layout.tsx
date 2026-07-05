"use client";

import MarketplaceAreaLayout from "@/components/marketplace/MarketplaceAreaLayout";
import { AdminAccessGuard } from "@/components/marketplace/AdminAccessGuard";
import { ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketplaceAreaLayout>
      <AdminAccessGuard>
        <div className="mb-5 rounded-2xl border border-[#c2c9bb]/35 bg-white/80 px-4 py-4 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3ea] text-[#154212]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72796e]">
                  Administration
                </p>
                <h1 className="text-xl font-black text-[#191c18] sm:text-2xl">
                  Espace admin
                </h1>
              </div>
            </div>
            <p className="max-w-xl text-sm font-medium leading-6 text-[#5c6258]">
              Gestion de la plateforme, des vendeurs, des transactions et de la moderation.
            </p>
          </div>
        </div>
        {children}
      </AdminAccessGuard>
    </MarketplaceAreaLayout>
  );
}
