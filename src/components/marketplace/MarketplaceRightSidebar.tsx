"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Gavel,
  Headphones,
  PackagePlus,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Wallet,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/stores/auth.store";
import { PushNotificationModal } from "./PushNotificationModal";

function sellerView(pathname: string, rawRole?: string) {
  return (
    rawRole === "admin" ||
    rawRole === "seller" ||
    rawRole === "vendor" ||
    pathname.startsWith("/my-shop") ||
    pathname.startsWith("/add-product") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/seller")
  );
}

export function MarketplaceRightSidebar() {
  const pathname = usePathname();
  const { user, isHydrated } = useAuthStore();
  const { totalItems, totalPrice } = useCart();

  if (!isHydrated) {
    return (
      <aside className="hidden w-[300px] shrink-0 xl:block">
        <div className="sticky top-24 space-y-4">
          {[1, 2, 3].map((section) => (
            <section
              key={section}
              className="rounded-2xl border border-[#c2c9bb]/35 bg-white/75 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-[#e7e9e1]" />
                  <div className="h-6 w-32 animate-pulse rounded bg-[#dce2d8]" />
                </div>
                <div className="h-11 w-11 animate-pulse rounded-xl bg-[#eaf3de]" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-10 animate-pulse rounded-xl bg-[#e7e9e1]" />
                <div className="h-10 animate-pulse rounded-xl bg-[#e7e9e1]" />
              </div>
            </section>
          ))}
        </div>
      </aside>
    );
  }

  const isSellerView = sellerView(pathname, String(user?.role ?? "user"));

  const mainActions = isSellerView
    ? [
        { href: "/add-product", label: "Publier un produit", icon: PackagePlus },
        { href: "/my-shop", label: "Gérer ma boutique", icon: Store },
        { href: "/vendor/dashboard", label: "Suivre les ventes", icon: BarChart3 },
      ]
    : [
        { href: "/marketplace", label: "Produits vérifiés", icon: BadgeCheck },
        { href: "/orders", label: "Suivi livraison", icon: Truck },
        { href: "/wallet", label: "Paiements", icon: Wallet },
      ];

  const quickOptions = isSellerView
    ? [
        { href: "/seller/disputes", label: "Litiges ventes", icon: Gavel },
        { href: "/wallet", label: "Portefeuille", icon: Wallet },
        { href: "/marketplace/settings", label: "Paramètres", icon: Settings },
        { href: "/marketplace/support", label: "Support vendeur", icon: Headphones },
      ]
    : [
        { href: "/disputes", label: "Mes litiges", icon: Gavel },
        { href: "/wallet", label: "Portefeuille", icon: Wallet },
        { href: "/vendor/dashboard", label: "Espace vendeur", icon: Store },
        { href: "/marketplace/support", label: "Support", icon: Headphones },
      ];

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="sticky top-24 space-y-4">
        <section className="rounded-2xl border border-[#c2c9bb]/35 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#72796e]">
                Panier
              </p>
              <h3 className="mt-1 text-xl font-black text-[#191c18]">
                {totalItems} article{totalItems > 1 ? "s" : ""}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3de] text-[#154212]">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm font-bold text-[#154212]">
            {totalPrice.toLocaleString()} FCFA
          </p>
          <Link
            href="/orders"
            className="mt-4 flex items-center justify-between rounded-xl bg-[#154212] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2d5a27]"
          >
            Voir mes commandes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-2xl border border-[#c2c9bb]/35 bg-white/75 p-4 shadow-sm backdrop-blur">
          <h3 className="text-sm font-black text-[#191c18]">
            {isSellerView ? "Actions vendeur" : "Achat sécurisé"}
          </h3>
          <div className="mt-3 space-y-2">
            <PushNotificationModal />
            {mainActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#c2c9bb]/35 bg-white/75 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#72796e]">
                Options
              </p>
              <h3 className="mt-1 text-sm font-black text-[#191c18]">
                Accès rapides
              </h3>
            </div>
            <Settings className="h-4 w-4 text-[#154212]" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {quickOptions.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/marketplace" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl border px-3 py-3 transition ${
                    active
                      ? "border-[#154212]/20 bg-[#eaf3de] text-[#154212]"
                      : "border-[#c2c9bb]/25 bg-[#f9faf2]/70 text-[#42493e] hover:border-[#154212]/20 hover:bg-[#eaf3de]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="mt-2 block text-xs font-bold leading-4">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
