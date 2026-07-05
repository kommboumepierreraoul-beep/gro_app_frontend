"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  ChevronRight,
  Clock,
  Coins,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  Receipt,
  Scale,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  UserCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { usePushNotification } from "@/hooks/usePushNotification";
import toast from "react-hot-toast";

interface VendorLayoutProps {
  children: React.ReactNode;
}

type Notif = {
  id: string;
  title: string;
  message: string;
  type: string;
  url: string | null;
  read: boolean;
  created_at: string;
};

const navItems = [
  {
    path: "/community",
    label: "Communaute",
    icon: Home,
    roles: ["user", "seller", "admin"],
  },
  {
    path: "/marketplace",
    label: "Marketplace",
    icon: Store,
    roles: ["user", "seller", "admin"],
  },
  {
    path: "/vendor/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: ["seller", "admin"],
  },
  {
    path: "/orders",
    label: "Commandes",
    icon: ShoppingCart,
    roles: ["user", "seller", "admin"],
  },
  {
    path: "/add-product",
    label: "Ajouter produit",
    icon: PlusCircle,
    roles: ["seller", "admin"],
  },
  {
    path: "/admin/sellers",
    label: "Ventes",
    icon: TrendingUp,
    roles: ["seller", "admin"],
  },
  {
    path: "/disputes",
    label: "Litiges",
    icon: AlertCircle,
    roles: ["user", "seller", "admin"],
  },
  {
    path: "/wallet",
    label: "Portefeuille",
    icon: Wallet,
    roles: ["user", "seller", "admin"],
  },
  {
    path: "/my-shop",
    label: "Ma boutique",
    icon: Store,
    roles: ["seller"],
  },
  {
    path: "/account",
    label: "Compte",
    icon: UserCircle,
    roles: ["user", "seller", "admin"],
  },
];

const adminNavItems = [
  { path: "/admin", label: "Validation produits", icon: ShieldCheck },
  { path: "/admin/users", label: "Utilisateurs", icon: Users },
  { path: "/admin/catalog", label: "Catalogue", icon: LayoutGrid },
  { path: "/admin/disputes", label: "Litiges admin", icon: Scale },
  { path: "/admin/transactions", label: "Transactions", icon: Receipt },
];

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "a l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function NotifIcon({ type }: { type: string }) {
  const base = "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl";
  if (type.includes("order") || type.includes("new_order")) {
    return (
      <div className={`${base} bg-[#eaf3de] text-[#154212]`}>
        <ShoppingBag size={16} />
      </div>
    );
  }
  if (type.includes("funds") || type.includes("deposit")) {
    return (
      <div className={`${base} bg-amber-50 text-amber-700`}>
        <Coins size={16} />
      </div>
    );
  }
  if (type.includes("product_approved")) {
    return (
      <div className={`${base} bg-blue-50 text-blue-700`}>
        <Package size={16} />
      </div>
    );
  }
  if (type.includes("product_rejected")) {
    return (
      <div className={`${base} bg-red-50 text-red-700`}>
        <AlertTriangle size={16} />
      </div>
    );
  }
  return (
    <div className={`${base} bg-[#f3f4ed] text-[#42493e]`}>
      <Bell size={16} />
    </div>
  );
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { subscribed, subscribe, unsubscribe } = usePushNotification();
  const pathname = usePathname();
  const router = useRouter();

  const fetchCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnread(res.data.unread_count);
    } catch {}
  }, []);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifs(res.data.notifications);
      setUnread(res.data.unread_count);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user");
        setUserRole(res.data.role);
        setIsAdmin(res.data.role === "admin" || res.data.is_admin === true);
      } catch {}
    };

    fetchUser();
    const initialFetch = setTimeout(fetchCount, 0);
    const interval = setInterval(fetchCount, 30000);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchCount]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const togglePanel = () => {
    const next = !panelOpen;
    setPanelOpen(next);
    if (next) fetchNotifs();
  };

  const markRead = async (id: string, url: string | null) => {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch {}
    setNotifs((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
    setUnread((prev) => Math.max(0, prev - 1));
    setPanelOpen(false);
    if (url) router.push(url);
  };

  const markAll = async () => {
    try {
      await api.post("/notifications/mark-all-read");
    } catch {}
    setNotifs((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnread(0);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("auth_token");
      router.push("/login");
      toast.success("Deconnecte");
    } catch {
      toast.error("Erreur");
    }
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  const renderNavLink = (
    item: { path: string; label: string; icon: React.ElementType },
  ) => {
    const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
    const Icon = item.icon;

    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          active
            ? "bg-[#eaf3de] text-[#154212] shadow-sm"
            : "text-[#42493e] hover:bg-[#f3f4ed] hover:text-[#154212]"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {active && <ChevronRight className="h-4 w-4" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9faf2] text-[#191c18]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[#d9ddd2] bg-white/85 shadow-[0_16px_40px_rgba(21,66,18,0.08)] backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-[#c2c9bb]/40 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#154212]">
              <Store className="h-5 w-5 text-[#bcf0ae]" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-lg font-bold text-[#154212]">
                AgriPulse
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#72796e]">
                Market hub
              </span>
            </div>
          </div>

          <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
            {filteredNavItems.map(renderNavLink)}

            {isAdmin && (
              <>
                <div className="mt-3 border-t border-[#c2c9bb]/40 pt-4">
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[#72796e]">
                    Administration
                  </p>
                </div>
                {adminNavItems.map(renderNavLink)}
              </>
            )}
          </nav>

          <div className="border-t border-[#c2c9bb]/40 p-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#42493e] transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              Deconnexion
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-[#c2c9bb]/40 bg-[#f9faf2]/95 shadow-[0_2px_16px_rgba(21,66,18,0.06)] backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 transition hover:bg-[#eaf3de] lg:hidden"
            >
              <Menu className="h-5 w-5 text-[#154212]" />
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <Store className="h-5 w-5 text-[#154212]" />
              <span className="text-lg font-bold text-[#154212]">
                AgriPulse
              </span>
            </div>

            <div className="ml-auto relative" ref={panelRef}>
              <button
                onClick={togglePanel}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#c2c9bb]/50 bg-white/80 transition hover:bg-[#eaf3de]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-[#42493e]" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#f9faf2] bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {panelOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#c2c9bb]/50 bg-[#f9faf2]/98 shadow-xl backdrop-blur-xl"
                  style={{ boxShadow: "0 16px 40px rgba(21,66,18,0.12)" }}
                >
                  <div className="flex items-center justify-between border-b border-[#c2c9bb]/35 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#191c18]">
                        Notifications
                      </span>
                      {unread > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button
                          onClick={markAll}
                          className="text-xs text-[#154212] hover:underline"
                        >
                          Tout lire
                        </button>
                      )}
                      <button
                        onClick={() => setPanelOpen(false)}
                        className="flex h-6 w-6 items-center justify-center rounded text-[#72796e] transition hover:bg-[#f3f4ed]"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="flex flex-col items-center gap-2 py-8 text-[#72796e]">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#154212] border-t-transparent" />
                        <span className="text-xs">Chargement...</span>
                      </div>
                    ) : notifs.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-10 text-[#72796e]">
                        <Bell size={28} className="opacity-30" />
                        <span className="text-sm">Aucune notification</span>
                      </div>
                    ) : (
                      notifs.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markRead(notif.id, notif.url)}
                          className={`flex w-full items-start gap-3 border-b border-[#c2c9bb]/20 px-4 py-3 text-left transition hover:bg-[#f3f4ed] ${
                            !notif.read ? "bg-[#eaf3de]/70" : ""
                          }`}
                        >
                          <NotifIcon type={notif.type} />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`mb-0.5 truncate text-xs ${
                                !notif.read
                                  ? "font-medium text-[#191c18]"
                                  : "text-[#42493e]"
                              }`}
                            >
                              {notif.title}
                            </p>
                            <p className="line-clamp-2 text-xs leading-relaxed text-[#72796e]">
                              {notif.message}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-[10px] text-[#72796e]">
                              <Clock size={10} />
                              {timeAgo(notif.created_at)}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#154212]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#c2c9bb]/35 px-4 py-2.5">
                    <button className="text-xs text-[#154212] hover:underline">
                      Voir toutes
                    </button>
                    {!subscribed ? (
                      <button
                        onClick={subscribe}
                        className="rounded-full bg-[#154212] px-3 py-1 text-xs text-white transition hover:bg-[#2d5a27]"
                      >
                        Activer les notifs
                      </button>
                    ) : (
                      <button
                        onClick={unsubscribe}
                        className="text-xs text-[#72796e] transition hover:text-red-500"
                      >
                        Desactiver
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] p-3 pb-20 sm:p-5 lg:p-6">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
