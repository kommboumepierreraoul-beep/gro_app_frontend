"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  PackagePlus,
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
    pathname.startsWith("/vendor")
  );
}

export function MarketplaceRightSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { totalItems, totalPrice } = useCart();
  const isSellerView = sellerView(pathname, String(user?.role ?? "user"));

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
            {(isSellerView
              ? [
                  {
                    href: "/add-product",
                    label: "Publier un produit",
                    icon: PackagePlus,
                  },
                  {
                    href: "/my-shop",
                    label: "Gérer ma boutique",
                    icon: Store,
                  },
                  {
                    href: "/vendor/dashboard",
                    label: "Suivre les ventes",
                    icon: BarChart3,
                  },
                ]
              : [
                  { href: "/marketplace", label: "Produits vérifiés", icon: BadgeCheck },
                  { href: "/orders", label: "Suivi livraison", icon: Truck },
                  { href: "/wallet", label: "Paiements", icon: Wallet },
                ]
            ).map((item) => {
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
      </div>
    </aside>
  );
}
