"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Gavel,
  Home,
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Store,
  UserCircle,
  Wallet,
} from "lucide-react";

type MobileNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const buyerItems: MobileNavItem[] = [
  { href: "/marketplace", label: "Market", icon: Store },
  { href: "/orders", label: "Achats", icon: ShoppingBag },
  { href: "/disputes", label: "Litiges", icon: Gavel },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/account", label: "Compte", icon: UserCircle },
];

const sellerItems: MobileNavItem[] = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-shop", label: "Boutique", icon: Home },
  { href: "/add-product", label: "Publier", icon: PlusCircle },
  { href: "/orders", label: "Ventes", icon: ShoppingBag },
  { href: "/seller/disputes", label: "Litiges", icon: Gavel },
];

export function MarketplaceMobileNav() {
  const pathname = usePathname();
  const isSellerArea =
    pathname.startsWith("/my-shop") ||
    pathname.startsWith("/add-product") ||
    pathname.startsWith("/edit-product") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/seller");

  const items = isSellerArea ? sellerItems : buyerItems;
  const switchHref = isSellerArea ? "/marketplace" : "/my-shop";
  const switchLabel = isSellerArea ? "Espace acheteur" : "Espace vendeur";

  const isActive = (href: string) =>
    pathname === href || (href !== "/marketplace" && pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-2xl border border-[#c2c9bb]/45 bg-[#f9faf2]/95 shadow-[0_18px_40px_rgba(21,66,18,0.18)] backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between border-b border-[#c2c9bb]/30 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#72796e]">
            {isSellerArea ? "Vendeur" : "Acheteur"}
          </p>
          <p className="text-xs font-black text-[#191c18]">
            {isSellerArea ? "Gestion boutique" : "Marketplace"}
          </p>
        </div>

        <Link
          href={switchHref}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#154212] px-3 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#2d5a27]"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {switchLabel}
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-1 px-1.5 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 min-w-0 flex-col items-center justify-center rounded-xl px-1 text-[9px] font-bold transition sm:text-[10px] ${
                active
                  ? "bg-[#154212] text-white"
                  : "text-[#72796e] hover:bg-[#eaf3de] hover:text-[#154212]"
              }`}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="max-w-full truncate leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
