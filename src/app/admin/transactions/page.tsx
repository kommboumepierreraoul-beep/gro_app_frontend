'use client';

import VendorLayout from '@/components/layouts/VendorLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  TrendingUp, Download, Search, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle, Activity, Wallet,
  Banknote, ArrowUpRight, ArrowDownLeft, ShoppingBag, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Transaction = {
  id: number;
  transaction_id: string;
  type: 'sale' | 'payout' | 'refund' | 'deposit';
  method: string;
  amount: number;
  status: 'successful' | 'pending' | 'failed' | 'processing';
  date: string;
  customer?: string;
  order_id?: number;
};

type FinancialStats = {
  gross_volume: number;
  gross_volume_change: number;
  payouts_pending: number;
  payouts_pending_orders: number;
  net_revenue: number;
  net_revenue_change: number;
  total_transactions: number;
};

type ChartData = {
  month: string;
  revenue: number;
  payouts: number;
  profit: number;
};

type Activity = {
  id: string;
  message: string;
  time: string;
  icon: JSX.Element;
};

function AdminTransactionsContent() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersRes = await api.get('/admin/orders');
      const orders = ordersRes.data.data || [];

      // Activités récentes
      const sorted = [...orders].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const activities: Activity[] = [];
      for (let i = 0; i < Math.min(5, sorted.length); i++) {
        const order = sorted[i];
        let icon: JSX.Element;
        let message = '';
        switch (order.status) {
          case 'completed':
            icon = <CheckCircle size={16} className="text-emerald-400" />;
            message = `Commande #${order.order_number} finalisée`;
            break;
          case 'paid':
            icon = <Banknote size={16} className="text-blue-400" />;
            message = `Paiement reçu pour commande #${order.order_number}`;
            break;
          case 'shipping':
            icon = <ArrowUpRight size={16} className="text-amber-400" />;
            message = `Commande #${order.order_number} expédiée`;
            break;
          case 'delivered':
            icon = <CheckCircle size={16} className="text-amber-400" />;
            message = `Commande #${order.order_number} livrée (en attente)`;
            break;
          default:
            icon = <ShoppingBag size={16} className="text-emerald-400" />;
            message = `Nouvelle commande #${order.order_number}`;
        }
        activities.push({
          id: `act-${order.id}`,
          message,
          time: timeAgo(order.created_at),
          icon,
        });
      }
      setRecentActivities(activities);

      // Statistiques
      const sales = orders.filter((o: any) => o.status === 'completed');
      const totalSales = sales.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      const pendingPayouts = orders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      const netRevenue = totalSales * 0.15;
      setStats({
        gross_volume: totalSales,
        gross_volume_change: 12.5,
        payouts_pending: pendingPayouts,
        payouts_pending_orders: orders.filter((o: any) => o.status === 'delivered').length,
        net_revenue: netRevenue,
        net_revenue_change: 5.2,
        total_transactions: orders.length,
      });

      // Transactions
      const txList: Transaction[] = orders.map((order: any) => ({
        id: order.id,
        transaction_id: `TR-${String(100000 + order.id).slice(1)}`,
        type: order.status === 'completed' ? 'sale' : order.status === 'refunded' ? 'refund' : 'sale',
        method: order.payment_method || 'NotchPay',
        amount: order.total_amount,
        status: order.status === 'completed' ? 'successful' : order.status === 'pending' ? 'pending' : 'processing',
        date: order.created_at,
        customer: order.user?.name || order.user?.email || 'Client',
        order_id: order.id,
      }));
      setTransactions(txList);

      // Graphique
      const monthly: Record<string, { revenue: number; payouts: number }> = {};
      orders.forEach((order: any) => {
        const date = new Date(order.created_at);
        const month = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (!monthly[month]) monthly[month] = { revenue: 0, payouts: 0 };
        if (order.status === 'completed') monthly[month].revenue += order.total_amount;
        else if (order.status === 'delivered') monthly[month].payouts += order.total_amount;
      });
      let chartArray = Object.entries(monthly).slice(-12).map(([m, d]) => ({
        month: m,
        revenue: d.revenue,
        payouts: d.payouts,
        profit: d.revenue * 0.15,
      }));
      chartArray = chartArray.map(item => ({
        ...item,
        revenue: isNaN(item.revenue) ? 0 : item.revenue,
        profit: isNaN(item.profit) ? 0 : item.profit,
      }));
      setChartData(chartArray.length ? chartArray : [{ month: 'Aucune', revenue: 0, payouts: 0, profit: 0 }]);
    } catch (error) {
      console.error(error);
      toast.error('Données de démonstration (API non disponible)');
      // Fallback
      setRecentActivities([
        { id: '1', message: 'Paiement versé à AGRI-PRO', time: 'Il y a 2 min', icon: <CheckCircle size={16} className="text-emerald-400" /> },
        { id: '2', message: 'Nouvelle commande #8234', time: "Aujourd'hui, 10:45", icon: <ShoppingBag size={16} className="text-emerald-400" /> },
        { id: '3', message: 'Demande de remboursement #7190', time: "Aujourd'hui, 08:12", icon: <AlertCircle size={16} className="text-red-400" /> },
      ]);
      const possibleTypes: ('sale' | 'payout' | 'refund')[] = ['sale', 'payout', 'refund'];
      const possibleStatuses: ('successful' | 'pending' | 'failed')[] = ['successful', 'pending', 'failed'];
      const fakeTx: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        transaction_id: `TR-${100000 + i}`,
        type: possibleTypes[i % possibleTypes.length],
        method: 'NotchPay',
        amount: Math.floor(Math.random() * 50000) + 1000,
        status: possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        customer: `Client ${i}`,
      }));
      setTransactions(fakeTx);
      setStats({
        gross_volume: 1284500,
        gross_volume_change: 12.5,
        payouts_pending: 42350,
        payouts_pending_orders: 82,
        net_revenue: 312900,
        net_revenue_change: 5.2,
        total_transactions: 1240,
      });
      setChartData([
        { month: 'Jan', revenue: 85000, payouts: 32000, profit: 12750 },
        { month: 'Fév', revenue: 92000, payouts: 35000, profit: 13800 },
        { month: 'Mar', revenue: 105000, payouts: 41000, profit: 15750 },
        { month: 'Avr', revenue: 118000, payouts: 43000, profit: 17700 },
        { month: 'Mai', revenue: 125000, payouts: 46000, profit: 18750 },
        { month: 'Juin', revenue: 142000, payouts: 51000, profit: 21300 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(tx => {
    if (search && !tx.transaction_id.toLowerCase().includes(search.toLowerCase()) && !tx.customer?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    return true;
  });
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'successful': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle size={12} /> Réussie</span>;
      case 'pending': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"><Clock size={12} /> En attente</span>;
      case 'processing': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"><Activity size={12} /> Traitement</span>;
      default: return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30"><XCircle size={12} /> Échouée</span>;
    }
  };

  const typeIcon = (type: string) => {
    if (type === 'sale') return <ShoppingBag size={16} className="text-emerald-400" />;
    if (type === 'payout') return <ArrowUpRight size={16} className="text-amber-400" />;
    if (type === 'refund') return <ArrowDownLeft size={16} className="text-red-400" />;
    return <Wallet size={16} className="text-blue-400" />;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-slate-400 animate-pulse">Chargement du tableau de bord...</div></div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all group">
          <div className="flex justify-between items-start"><div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20"><TrendingUp className="text-emerald-400" size={22} /></div><span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+{stats?.gross_volume_change}%</span></div>
          <p className="text-slate-400 text-sm mt-4">Transaction Gross Volume</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.gross_volume.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-amber-500/30 transition-all group">
          <div className="flex justify-between items-start"><div className="p-2 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20"><Clock className="text-amber-400" size={22} /></div></div>
          <p className="text-slate-400 text-sm mt-4">Payouts Pending</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.payouts_pending.toLocaleString()} FCFA</p>
          <p className="text-xs text-slate-500 mt-1">{stats?.payouts_pending_orders} commandes en attente</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-blue-500/30 transition-all group">
          <div className="flex justify-between items-start"><div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20"><Banknote className="text-blue-400" size={22} /></div><span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+{stats?.net_revenue_change}%</span></div>
          <p className="text-slate-400 text-sm mt-4">Net Revenue</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.net_revenue.toLocaleString()} FCFA</p>
        </div>
      </div>

      {/* Graphique + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-semibold text-white">Évolution des revenus</h2><div className="flex gap-2"><button className="px-3 py-1 text-xs bg-slate-800 rounded-lg text-slate-300">30j</button><button className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg">Annuel</button></div></div>
          <div className="h-72">
            {chartData.length > 0 && chartData.every(d => typeof d.revenue === 'number' && typeof d.profit === 'number') ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={val => `${(val/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" name="Revenu brut" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="url(#profGrad)" name="Profit net" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Données non disponibles</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-4">Activité récente</h2>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucune activité récente</p>
            ) : (
              recentActivities.map(activity => (
                <div key={activity.id} className="flex gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="p-1.5 bg-slate-700/50 rounded-full">{activity.icon}</div>
                  <div>
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Historique des transactions</h2>
          <div className="flex gap-3">
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher ID ou client..." className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none" /></div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"><option value="all">Tous statuts</option><option value="successful">Réussies</option><option value="pending">En attente</option><option value="processing">Traitement</option><option value="failed">Échouées</option></select>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-sm text-slate-300 hover:bg-slate-700"><Download size={16} /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr className="text-left text-slate-400 text-sm">
                <th className="p-4 font-medium">Transaction ID</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Méthode</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(tx => (
                <tr key={tx.id} className="border-t border-slate-800 hover:bg-slate-800/30 cursor-pointer transition" onClick={() => setSelectedTx(tx)}>
                  <td className="p-4 text-white font-mono text-sm">{tx.transaction_id}</td>
                  <td className="p-4"><div className="flex items-center gap-2">{typeIcon(tx.type)}<span className="text-slate-300 capitalize">{tx.type}</span></div></td>
                  <td className="p-4 text-slate-300">{tx.method}</td>
                  <td className="p-4 text-slate-400">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                  <td className="p-4">{statusBadge(tx.status)}</td>
                  <td className={`p-4 text-right font-semibold ${tx.type === 'sale' ? 'text-emerald-400' : tx.type === 'payout' ? 'text-amber-400' : 'text-red-400'}`}>{tx.type === 'sale' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <div className="p-4 border-t border-slate-800 flex justify-between items-center"><p className="text-slate-400 text-sm">Affichage de {((currentPage-1)*itemsPerPage)+1} à {Math.min(currentPage*itemsPerPage, filtered.length)} sur {filtered.length}</p><div className="flex gap-2"><button disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)} className="p-2 rounded-lg bg-slate-800 disabled:opacity-40"><ChevronLeft size={16} /></button><span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg">{currentPage}</span><button disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)} className="p-2 rounded-lg bg-slate-800 disabled:opacity-40"><ChevronRight size={16} /></button></div></div>}
      </div>

      {/* Modal détails */}
      {selectedTx && <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTx(null)}><div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">Détails transaction</h3><button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-white">✕</button></div><div className="space-y-3"><div className="flex justify-between"><span className="text-slate-400">ID</span><span className="text-white font-mono">{selectedTx.transaction_id}</span></div><div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white capitalize">{selectedTx.type}</span></div><div className="flex justify-between"><span className="text-slate-400">Méthode</span><span className="text-white">{selectedTx.method}</span></div><div className="flex justify-between"><span className="text-slate-400">Client</span><span className="text-white">{selectedTx.customer || '—'}</span></div><div className="flex justify-between"><span className="text-slate-400">Montant</span><span className="text-white font-bold">{selectedTx.amount.toLocaleString()} FCFA</span></div><div className="flex justify-between"><span className="text-slate-400">Statut</span>{statusBadge(selectedTx.status)}</div><div className="flex justify-between"><span className="text-slate-400">Date</span><span className="text-white">{new Date(selectedTx.date).toLocaleString('fr-FR')}</span></div></div><button onClick={() => setSelectedTx(null)} className="w-full mt-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl transition">Fermer</button></div></div>}
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <VendorLayout>
      <AdminTransactionsContent />
    </VendorLayout>
  );
}