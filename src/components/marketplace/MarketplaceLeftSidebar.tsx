"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Gavel,
  Headphones,
  Home,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserCircle,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

type RoleView = "buyer" | "seller" | "admin";

const baseLinks = [
  { href: "/marketplace", label: "Catalogue", icon: Store },
  { href: "/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/disputes", label: "Mes litiges", icon: Gavel },
  { href: "/wallet", label: "Portefeuille", icon: Wallet },
  { href: "/marketplace/support", label: "Support", icon: Headphones },
  { href: "/marketplace/settings", label: "Parametres", icon: Settings },
  { href: "/account", label: "Compte", icon: UserCircle },
  { href: "/community", label: "Communauté", icon: Home },
];

const sellerLinks = [
  { href: "/vendor/dashboard", label: "Espace vendeur", icon: BarChart3 },
  { href: "/my-shop", label: "Ma boutique", icon: Store },
  { href: "/add-product", label: "Ajouter produit", icon: PlusCircle },
  { href: "/seller/disputes", label: "Litiges ventes", icon: Gavel },
];

const adminLinks = [
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/admin/users", label: "Utilisateurs", icon: UserCircle },
  { href: "/admin/catalog", label: "Catalogue admin", icon: Package },
  { href: "/admin/sellers", label: "Vendeurs", icon: Settings },
  { href: "/admin/transactions", label: "Transactions", icon: Wallet },
  { href: "/admin/disputes", label: "Litiges admin", icon: Gavel },
  { href: "/admin/moderation", label: "Modération", icon: ShieldCheck },
];

function getRoleView(pathname: string, rawRole?: string): RoleView {
  if (pathname.startsWith("/admin")) return "admin";
  if (rawRole === "admin") return "admin";
  if (
    rawRole === "seller" ||
    rawRole === "vendor" ||
    pathname.startsWith("/my-shop") ||
    pathname.startsWith("/add-product") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/seller")
  ) {
    return "seller";
  }

  return "buyer";
}

export function MarketplaceLeftSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const roleView = getRoleView(pathname, String(user?.role ?? "user"));

  const links = [
    ...baseLinks,
    ...(roleView === "buyer"
      ? [{ href: "/vendor/dashboard", label: "Espace vendeur", icon: BarChart3 }]
      : sellerLinks),
    ...(roleView === "admin" ? adminLinks : []),
  ];

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-[#c2c9bb]/40 bg-[#f9faf2]/95 shadow-[4px_0_24px_rgba(21,66,18,0.04)] backdrop-blur-xl lg:flex">
      <div className="border-b border-[#c2c9bb]/35 px-4 py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#72796e]">
          Marketplace
        </p>
        <h2 className="mt-1 text-lg font-black text-[#191c18]">
          {roleView === "buyer" ? "Espace acheteur" : "Espace vendeur"}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#72796e]">
          {roleView === "admin"
            ? "Pilotage du marché et des vendeurs."
            : roleView === "seller"
              ? "Gérez vos produits, ventes et commandes."
              : "Achetez, suivez vos commandes et vos paiements."}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/marketplace" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[#154212] text-white shadow-sm"
                  : "text-[#42493e] hover:bg-[#eaf3de] hover:text-[#154212]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
