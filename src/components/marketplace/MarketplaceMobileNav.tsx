"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ShoppingBag, Store, UserCircle, Wallet } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export function MarketplaceMobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = String(user?.role ?? "user");
  const isSeller =
    role === "admin" ||
    role === "seller" ||
    role === "vendor" ||
    pathname.startsWith("/my-shop") ||
    pathname.startsWith("/add-product") ||
    pathname.startsWith("/vendor");

  const items = [
    { href: "/marketplace", label: "Market", icon: Store },
    { href: "/orders", label: "Commandes", icon: ShoppingBag },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    isSeller
      ? { href: "/my-shop", label: "Boutique", icon: Home }
      : { href: "/community", label: "Communauté", icon: Home },
    isSeller
      ? { href: "/add-product", label: "Publier", icon: PlusCircle }
      : { href: "/account", label: "Compte", icon: UserCircle },
  ];

  return (
    <nav className="fixed inset-x-3 bottom-4 z-50 rounded-2xl border border-[#c2c9bb]/45 bg-[#f9faf2]/95 px-2 py-2 shadow-[0_18px_40px_rgba(21,66,18,0.18)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/marketplace" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 flex-col items-center justify-center rounded-xl text-[10px] font-bold transition ${
                active
                  ? "bg-[#154212] text-white"
                  : "text-[#72796e] hover:bg-[#eaf3de] hover:text-[#154212]"
              }`}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
