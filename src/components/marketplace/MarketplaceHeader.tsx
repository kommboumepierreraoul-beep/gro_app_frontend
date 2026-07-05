"use client";

import React from "react";
import Link from "next/link";
import { Search, ShoppingCart, Bell, Plus, Sprout } from "lucide-react";

export default function MarketplaceHeader({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <header className="sticky top-16 z-40 border-b border-[#c2c9bb]/40 bg-[#f9faf2]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#154212] shadow-sm">
              <Sprout className="h-5 w-5 text-[#bcf0ae]" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-[#191c18]">
                Marketplace
              </h1>
              <p className="-mt-0.5 text-xs font-medium text-[#3b6934]">
                Produits, commandes et boutiques
              </p>
            </div>
          </div>

          <div className="relative min-w-0 flex-1 lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72796e]" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#c2c9bb]/50 bg-white/80 pl-10 pr-4 text-sm text-[#191c18] outline-none transition focus:border-[#bcf0ae] focus:ring-2 focus:ring-[#bcf0ae]/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c2c9bb]/50 bg-white/80 text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c2c9bb]/50 bg-white/80 text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]">
              <Bell className="h-5 w-5" />
            </button>
            <Link
              href="/add-product"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#154212] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5a27]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
