'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, X, LayoutDashboard, ShoppingCart, TrendingUp, 
  Wallet, Store, ShieldCheck, LogOut, Bell,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/vendor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/orders', label: 'Commandes', icon: ShoppingCart },
  { path: '/admin/sellers', label: 'Ventes', icon: TrendingUp },
  { path: '/wallet', label: 'Portefeuille', icon: Wallet },
  { path: '/my-shop', label: 'Ma Boutique', icon: Store },
];

export default function VendorLayout({ children }: VendorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/user');
        setIsAdmin(res.data.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('auth_token');
      router.push('/login');
      toast.success('Déconnecté');
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ea]">
      {/* Sidebar desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-600" />
              <span className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">AgriConnect</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin/transactions"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin/transactions'
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </nav>
          <div className="p-4 border-t border-emerald-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Contenu principal */}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-emerald-100/30 shadow-sm lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-emerald-100 transition">
              <Menu className="w-5 h-5 text-emerald-700" />
            </button>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-lg text-emerald-700">AgriConnect</span>
            </div>
            <button className="p-2 rounded-full hover:bg-emerald-100 transition relative">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
