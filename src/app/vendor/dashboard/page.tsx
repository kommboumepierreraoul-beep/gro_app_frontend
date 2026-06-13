// src/app/vendor/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import VendorLayout from '@/components/layouts/VendorLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Package, TrendingUp, ShoppingBag, Plus, HelpCircle, Filter, DollarSign, Clock, CheckCircle } from 'lucide-react';

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  weeklyData: { day: string; revenue: number }[];
  recentOrders: { id: number; order_number: string; customer: string; amount: number; status: string; date: string }[];
};

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    weeklyData: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/seller/orders'),
        api.get('/my-shop/products'),
      ]);

      const orders = ordersRes.data.data || [];
      const products = productsRes.data.data || [];

      const paidOrders = orders.filter((o: any) => o.status === 'paid' || o.status === 'completed');
      const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'paid').length;

      // Données hebdomadaires
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const revenueByDay = new Array(7).fill(0);
      paidOrders.forEach((order: any) => {
        const date = new Date(order.created_at);
        let dayIndex = date.getDay();
        dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        revenueByDay[dayIndex] += order.total_amount;
      });
      const weeklyData = days.map((day, i) => ({ day, revenue: revenueByDay[i] }));

      // Commandes récentes
      const recentOrders = orders.slice(0, 5).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        customer: o.user?.name || o.user?.email || 'Client',
        amount: o.total_amount,
        status: o.status,
        date: new Date(o.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
      }));

      setStats({ totalRevenue, totalOrders, pendingOrders, totalProducts: products.length, weeklyData, recentOrders });
    } catch (error) {
      console.error(error);
      toast.error('Impossible de charger les données');
      setStats({
        totalRevenue: 12450,
        totalOrders: 48,
        pendingOrders: 12,
        totalProducts: 24,
        weeklyData: [
          { day: 'Lun', revenue: 1240 }, { day: 'Mar', revenue: 2100 }, { day: 'Mer', revenue: 3200 },
          { day: 'Jeu', revenue: 1800 }, { day: 'Ven', revenue: 4100 }, { day: 'Sam', revenue: 2200 }, { day: 'Dim', revenue: 1500 },
        ],
        recentOrders: [
          { id: 1, order_number: 'ORD-001', customer: 'Marie D.', amount: 45, status: 'paid', date: 'Il y a 2h' },
          { id: 2, order_number: 'ORD-002', customer: 'Jean M.', amount: 22.5, status: 'shipping', date: 'Il y a 5h' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm font-bold text-primary">{payload[0].value.toLocaleString()} FCFA</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Chargement du tableau de bord...</div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-8">
        {/* En-tête avec gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <h1 className="text-2xl font-extrabold tracking-tight">Tableau de bord vendeur</h1>
            <p className="text-emerald-100 mt-1">Bienvenue, voici l’état de votre activité</p>
          </div>
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-emerald-600 opacity-30 blur-2xl"></div>
        </div>

        {/* Cartes statistiques modernes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <DollarSign size={22} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalRevenue.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <ShoppingBag size={22} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500">Commandes actives</p>
              <p className="text-2xl font-bold text-slate-800">{stats.pendingOrders}</p>
              <p className="text-xs text-slate-400 mt-1">{stats.totalOrders} au total</p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Package size={22} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500">Produits en ligne</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <TrendingUp size={22} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">68%</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500">Taux de conversion</p>
              <p className="text-2xl font-bold text-slate-800">68%</p>
            </div>
          </div>
        </div>

        {/* Graphique et activités */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Performance hebdomadaire</h3>
                <p className="text-sm text-slate-500">Revenus générés par jour (FCFA)</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                <Clock size={14} /> 7 derniers jours
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#areaGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Activité récente</h3>
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    {order.status === 'paid' ? <CheckCircle size={14} className="text-emerald-700" /> : <Clock size={14} className="text-slate-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{order.order_number}</p>
                    <p className="text-xs text-slate-400">{order.customer} • {order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{order.amount.toLocaleString()} FCFA</p>
                    <span className={`text-[10px] font-semibold ${order.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.status === 'paid' ? 'Payée' : 'En cours'}
                    </span>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && <p className="text-slate-400 text-sm">Aucune activité récente</p>}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/add-product" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-200 transition">
                <Plus size={22} />
              </div>
              <span className="text-sm font-semibold text-slate-700">Ajouter produit</span>
            </Link>
            <Link href="/my-shop" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-200 transition">
                <Package size={22} />
              </div>
              <span className="text-sm font-semibold text-slate-700">Gérer stock</span>
            </Link>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-200 transition">
                <TrendingUp size={22} />
              </div>
              <span className="text-sm font-semibold text-slate-700">Promotions</span>
            </button>
            <Link href="/support" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-200 transition">
                <HelpCircle size={22} />
              </div>
              <span className="text-sm font-semibold text-slate-700">Support</span>
            </Link>
          </div>
        </div>

        {/* Bannière promotionnelle */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-2xl overflow-hidden relative p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-md">
            <h3 className="text-2xl font-extrabold mb-2">Boostez votre visibilité !</h3>
            <p className="text-emerald-100 mb-6">Rejoignez le programme 'Producteurs Locaux' pour apparaître en tête de liste.</p>
            <button className="bg-white text-emerald-800 px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-emerald-50 transition">
              En savoir plus
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-40 opacity-10">
            <span className="material-symbols-outlined text-[200px] text-white">psychiatry</span>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}