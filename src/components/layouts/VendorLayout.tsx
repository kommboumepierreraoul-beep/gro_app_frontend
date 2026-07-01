'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LayoutDashboard, ShoppingCart, TrendingUp, Wallet, Store, ShieldCheck, LogOut, Bell, ChevronRight, X, Clock, ShoppingBag, Coins, Package, AlertTriangle, AlertCircle, Users, LayoutGrid, Scale, Receipt } from 'lucide-react';
import api from '@/lib/axios';
import { usePushNotification } from '@/hooks/usePushNotification';
import toast from 'react-hot-toast';

interface VendorLayoutProps { children: React.ReactNode; }

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
  { path: '/vendor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'seller'] },
  { path: '/orders', label: 'Commandes', icon: ShoppingCart, roles: ['user', 'seller', 'admin'] },
  { path: '/admin/sellers', label: 'Ventes', icon: TrendingUp, roles: ['seller', 'admin'] },
  { path: '/disputes', label: 'Litiges', icon: AlertCircle, roles: ['user', 'seller', 'admin'] },
  { path: '/wallet', label: 'Portefeuille', icon: Wallet, roles: ['user', 'seller', 'admin'] },
  { path: '/my-shop', label: 'Ma Boutique', icon: Store, roles: ['seller'] },
];

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function NotifIcon({ type }: { type: string }) {
  const base = "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0";
  if (type.includes('order') || type.includes('new_order')) return <div className={`${base} bg-emerald-50 text-emerald-700`}><ShoppingBag size={16} /></div>;
  if (type.includes('funds') || type.includes('deposit')) return <div className={`${base} bg-amber-50 text-amber-700`}><Coins size={16} /></div>;
  if (type.includes('product_approved')) return <div className={`${base} bg-blue-50 text-blue-700`}><Package size={16} /></div>;
  if (type.includes('product_rejected')) return <div className={`${base} bg-red-50 text-red-700`}><AlertTriangle size={16} /></div>;
  return <div className={`${base} bg-slate-100 text-slate-600`}><Bell size={16} /></div>;
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
  const { permission, subscribed, subscribe, unsubscribe } = usePushNotification();
  const pathname = usePathname();
  const router = useRouter();

  const fetchCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnread(res.data.unread_count);
    } catch {}
  }, []);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifs(res.data.notifications);
      setUnread(res.data.unread_count);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user');
        setUserRole(res.data.role);
        setIsAdmin(res.data.role === 'admin' || res.data.is_admin === true);
      } catch (error) {}
    };
    fetchUser();
    fetchCount();
    const iv = setInterval(fetchCount, 30000);
    return () => clearInterval(iv);
  }, [fetchCount]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const togglePanel = () => {
    const next = !panelOpen;
    setPanelOpen(next);
    if (next) fetchNotifs();
  };

  const markRead = async (id: string, url: string | null) => {
    try { await api.post(`/notifications/${id}/read`); } catch {}
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    setPanelOpen(false);
    if (url) router.push(url);
  };

  const markAll = async () => {
    try { await api.post('/notifications/mark-all-read'); } catch {}
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('auth_token');
      router.push('/login');
      toast.success('Déconnecté');
    } catch { toast.error('Erreur'); }
  };

  // Filtrer les items par rôle
  const filteredNavItems = navItems.filter(item => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  return (
    <div className="min-h-screen bg-[#eef4ea]">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-emerald-100 flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">Agripulse</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {filteredNavItems.map(item => {
              const active = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
            {isAdmin && (
              <>
                <div className="pt-4 mt-2 border-t border-emerald-100">
                  <p className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Administration</p>
                </div>
                {[
                  { path: '/admin', label: 'Validation produits', icon: ShieldCheck },
                  { path: '/admin/users', label: 'Utilisateurs', icon: Users },
                  { path: '/admin/catalog', label: 'Catalogue', icon: LayoutGrid },
                  { path: '/admin/disputes', label: 'Litiges (Admin)', icon: Scale },
                  { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
                ].map(item => {
                  const active = pathname === item.path || pathname.startsWith(item.path + '/');
                  return (
                    <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}`}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
          <div className="p-4 border-t border-emerald-100">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
              <LogOut className="w-5 h-5" />Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-emerald-100/30 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-emerald-100 transition lg:hidden">
              <Menu className="w-5 h-5 text-emerald-700" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <Store className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-lg text-emerald-700">Agripulse</span>
            </div>

            {/* Cloche + panel */}
            <div className="ml-auto relative" ref={panelRef}>
              <button onClick={togglePanel} className="relative w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition" aria-label="Notifications">
                <Bell className="w-4 h-4 text-slate-600" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {panelOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">Notifications</span>
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-medium rounded-full px-1.5 py-0.5">{unread}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAll} className="text-xs text-emerald-600 hover:underline">Tout lire</button>
                      )}
                      <button onClick={() => setPanelOpen(false)} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="py-8 flex flex-col items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Chargement...</span>
                      </div>
                    ) : notifs.length === 0 ? (
                      <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                        <Bell size={28} className="opacity-30" />
                        <span className="text-sm">Aucune notification</span>
                      </div>
                    ) : (
                      notifs.map(n => (
                        <button key={n.id} onClick={() => markRead(n.id, n.url)}
                          className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-slate-50 transition hover:bg-slate-50 ${!n.read ? 'bg-emerald-50/40' : ''}`}>
                          <NotifIcon type={n.type} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs mb-0.5 truncate ${!n.read ? 'font-medium text-slate-800' : 'text-slate-700'}`}>{n.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Clock size={10} />{timeAgo(n.created_at)}
                            </p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button className="text-xs text-emerald-600 hover:underline">
                      Voir toutes →
                    </button>
                    {!subscribed ? (
                      <button onClick={subscribe} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full hover:bg-emerald-700 transition">
                        🔔 Activer les notifs
                      </button>
                    ) : (
                      <button onClick={unsubscribe} className="text-xs text-slate-400 hover:text-red-500 transition">
                        Désactiver
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
