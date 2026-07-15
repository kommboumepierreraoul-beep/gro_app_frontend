"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import type { ComponentType, ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  Gavel,
  Home,
  LayoutGrid,
  Landmark,
  LayoutDashboard,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { AdminAccessGuard } from "@/components/marketplace/AdminAccessGuard";

type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Vue generale",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/system",
    label: "Console CRUD",
    description: "Administration complete",
    icon: LayoutGrid,
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    description: "Comptes et roles",
    icon: Users,
  },
  {
    href: "/admin/sellers",
    label: "Vendeurs",
    description: "Boutiques et ventes",
    icon: Store,
  },
  {
    href: "/admin/catalog",
    label: "Catalogue",
    description: "Produits et categories",
    icon: Boxes,
  },
  {
    href: "/admin/transactions",
    label: "Transactions",
    description: "Paiements et revenus",
    icon: Landmark,
  },
  {
    href: "/admin/disputes",
    label: "Litiges",
    description: "Arbitrage client-vendeur",
    icon: Gavel,
  },
  {
    href: "/admin/moderation",
    label: "Moderation",
    description: "Files de contenu",
    icon: ShieldCheck,
  },
  {
    href: "/admin/moderation/audit",
    label: "Audit",
    description: "Journal moderation",
    icon: BarChart3,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/moderation") {
    return (
      pathname === href ||
      (pathname.startsWith(`${href}/`) &&
        !pathname.startsWith("/admin/moderation/audit"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavLink({
  item,
  pathname,
  compact = false,
}: {
  item: AdminNavItem;
  pathname: string;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const active = isActivePath(pathname, item.href);

  if (compact) {
    return (
      <Link
        href={item.href}
        className={`flex min-w-[76px] flex-col items-center justify-center rounded-xl px-2 py-2 text-[10px] font-bold transition ${
          active
            ? "bg-[#243420] text-white"
            : "text-[#72796e] hover:bg-[#eef1e8] hover:text-[#191c18]"
        }`}
      >
        <Icon className="mb-1 h-4 w-4" />
        <span className="max-w-full truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
        active
          ? "bg-[#243420] text-white shadow-sm"
          : "text-[#42493e] hover:bg-[#eef1e8] hover:text-[#191c18]"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-white/15" : "bg-white text-[#31452d]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black">{item.label}</span>
        <span
          className={`block truncate text-xs font-medium ${
            active ? "text-white/70" : "text-[#72796e]"
          }`}
        >
          {item.description}
        </span>
      </span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current =
    [...adminNavItems]
      .reverse()
      .find((item) => isActivePath(pathname, item.href)) ?? adminNavItems[0];

  return (
    <AdminAccessGuard>
      <div className="admin-root flex h-dvh overflow-hidden bg-[#f6f7f0] text-[#191c18]">
        <Toaster position="top-right" />

        <aside className="hidden w-72 shrink-0 border-r border-[#c2c9bb]/45 bg-[#f9faf2]/95 shadow-[4px_0_24px_rgba(25,28,24,0.04)] backdrop-blur-xl lg:flex lg:flex-col">
          <div className="border-b border-[#c2c9bb]/35 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#243420] text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#72796e]">
                  Administration
                </p>
                <h1 className="truncate text-lg font-black">Espace admin</h1>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {adminNavItems.map((item) => (
              <AdminNavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>

          <div className="border-t border-[#c2c9bb]/35 p-3">
            <Link
              href="/marketplace"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[#42493e] transition hover:bg-[#eef1e8]"
            >
              <Home className="h-5 w-5 text-[#31452d]" />
              Retour marketplace
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-[#c2c9bb]/35 bg-[#f9faf2]/90 px-3 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef3ea] text-[#243420] lg:hidden">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72796e]">
                    Espace admin
                  </p>
                  <h2 className="truncate text-xl font-black sm:text-2xl">
                    {current.label}
                  </h2>
                </div>
              </div>

              <Link
                href="/marketplace"
                className="hidden rounded-xl border border-[#c2c9bb]/45 bg-white px-4 py-2 text-sm font-bold text-[#42493e] transition hover:bg-[#eef1e8] sm:inline-flex"
              >
                Marketplace
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto pb-1 lg:hidden">
              <nav className="flex min-w-max gap-1">
                {adminNavItems.map((item) => (
                  <AdminNavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    compact
                  />
                ))}
              </nav>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 pb-24 sm:px-5 sm:py-5 lg:px-6 lg:pb-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminAccessGuard>
  );
}
