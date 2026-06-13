'use client';

import VendorLayout from '@/components/layouts/VendorLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Transaction = {
  id: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
  order_id?: number;
  order_number?: string;
  product_name?: string;
  status?: 'pending' | 'completed' | 'failed';
};

type WalletData = {
  balance: number;
  total_credited: number;
  total_debited: number;
  currency: string;
};

function WalletContent() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [withdrawChannel, setWithdrawChannel] = useState('mtn');
  const [paymentMethod, setPaymentMethod] = useState('notchpay');
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchWalletData = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setWallet(res.data);
    } catch {
      toast.error('Impossible de charger le solde');
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/wallet/history');
      setTransactions(res.data.data || res.data || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('trxref') || urlParams.get('reference')) {
      const interval = setInterval(() => {
        fetchWalletData();
        fetchTransactions();
      }, 2000);
      setTimeout(() => clearInterval(interval), 15000);
      window.history.replaceState({}, '', '/wallet');
    }
  }, []);

  const handleDeposit = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Montant invalide');
      return;
    }
    setLoadingAction(true);
    try {
      const payload: any = { amount: amountNum, method: paymentMethod };
      if (paymentMethod === 'momo' && phoneNumber) payload.phone = phoneNumber;
      const res = await api.post('/wallet/deposit', payload);
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        toast.success('Dépôt demandé');
        setDepositModal(false);
        setAmount('');
        setPhoneNumber('');
        fetchWalletData();
        fetchTransactions();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du dépôt');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Numéro Mobile Money invalide');
      return;
    }
    setLoadingAction(true);
    try {
      await api.post('/wallet/withdraw', {
        amount: amountNum,
        phone: phoneNumber,
        channel: withdrawChannel,
      });
      toast.success('Retrait effectué');
      setWithdrawModal(false);
      setAmount('');
      setPhoneNumber('');
      setWithdrawChannel('mtn');
      fetchWalletData();
      fetchTransactions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du retrait');
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'credit') return t.type === 'credit';
    if (activeTab === 'debit') return t.type === 'debit';
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const chartData = () => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });
    const grouped: Record<string, { credit: number; debit: number }> = {};
    transactions.forEach(t => {
      const day = t.created_at.split('T')[0];
      if (!grouped[day]) grouped[day] = { credit: 0, debit: 0 };
      if (t.type === 'credit') grouped[day].credit += t.amount;
      else grouped[day].debit += t.amount;
    });
    return last30Days.map(day => ({
      date: day,
      credit: grouped[day]?.credit || 0,
      debit: grouped[day]?.debit || 0,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400 animate-pulse">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Carte solde principale */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
              <path d="M0,150 Q50,140 100,160 T200,120 T300,140 T400,80" fill="none" stroke="#a3e635" strokeWidth="4" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  SOLDE DISPONIBLE
                  <button onClick={() => setShowBalance(!showBalance)}>
                    <span className="material-symbols-outlined text-sm">{showBalance ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </p>
                <h1 className="text-4xl font-bold text-white mt-2">
                  {showBalance ? (wallet?.balance || 0).toLocaleString() : '••••••'}
                  <span className="text-xl font-medium text-lime-400"> FCFA</span>
                </h1>
              </div>
              <div className="bg-lime-500/20 p-2 rounded-full">
                <span className="material-symbols-outlined text-lime-400">account_balance_wallet</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-lime-400">trending_up</span>
                </div>
                <span className="text-xs text-lime-400 bg-lime-400/10 px-2 py-1 rounded-full">+12.5% ce mois</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDepositModal(true)}
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span> Déposer
                </button>
                <button
                  onClick={() => setWithdrawModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
                >
                  <span className="material-symbols-outlined text-base">remove_circle</span> Retirer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Actions Rapides</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { icon: 'vertical_align_bottom', label: 'Retirer', onClick: () => setWithdrawModal(true) },
              { icon: 'add_circle', label: 'Déposer', onClick: () => setDepositModal(true) },
              { icon: 'sync_alt', label: 'Transférer', onClick: () => toast('Bientôt disponible') },
              { icon: 'description', label: 'Relevés', onClick: () => toast('Export PDF bientôt') },
              { icon: 'grid_view', label: 'Plus', onClick: () => toast('Plus d’options à venir') },
            ].map(action => (
              <button key={action.label} onClick={action.onClick} className="flex flex-col items-center gap-2 min-w-[70px] group">
                <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center group-hover:bg-lime-500/20 transition">
                  <span className="material-symbols-outlined text-lime-400 text-2xl">{action.icon}</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-white transition">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Graphique d'évolution */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Évolution (30j)</h2>
            <button onClick={fetchTransactions} className="text-lime-400 hover:scale-105 transition">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData()}>
                <defs>
                  <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={val => val.slice(5)} />
                <YAxis tickFormatter={val => `${(val/1000).toFixed(0)}k`} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="credit" stroke="#a3e635" fill="url(#creditGrad)" name="Entrées" />
                <Area type="monotone" dataKey="debit" stroke="#06b6d4" fill="url(#debitGrad)" name="Sorties" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3 text-sm text-slate-400">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-lime-500 rounded-full"></div> Entrées</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-500 rounded-full"></div> Sorties</div>
          </div>
        </div>

        {/* Historique des transactions avec pagination */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Activités</h2>
            <button className="text-lime-400 text-sm font-semibold">Voir tout</button>
          </div>
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: 'Tout' },
              { key: 'credit', label: 'Ventes' },
              { key: 'debit', label: 'Retraits' },
              { key: 'credit', label: 'Dépôts' },
            ].map(tab => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.key || (tab.label === 'Dépôts' && activeTab === 'credit')
                    ? 'bg-lime-500 text-slate-950'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {paginatedTransactions.length === 0 ? (
              <div className="bg-white/5 backdrop-blur p-8 text-center text-slate-400 rounded-2xl">
                <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                <p>Aucune transaction</p>
              </div>
            ) : (
              paginatedTransactions.map(tx => (
                <div key={tx.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-lime-500/20' : 'bg-white/10'}`}>
                      <span className="material-symbols-outlined text-2xl">{tx.type === 'credit' ? 'eco' : 'payments'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {tx.type === 'credit' && tx.order_number
                          ? `Vente de ${tx.product_name || 'Produit'} #${tx.order_number}`
                          : tx.description}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'credit' ? 'text-lime-400' : 'text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      tx.status === 'completed'
                        ? (tx.type === 'credit' ? 'bg-lime-500/20 text-lime-400' : 'bg-cyan-500/20 text-cyan-400')
                        : tx.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status === 'completed'
                        ? (tx.type === 'credit' ? 'Succès' : 'Effectué')
                        : tx.status === 'pending'
                        ? 'En attente'
                        : 'Échec'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-slate-300">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {/* Bento stats (inchangé) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-4">
            <span className="material-symbols-outlined text-cyan-400">monitoring</span>
            <p className="text-xs text-slate-400 mt-2">Prêts en cours</p>
            <p className="text-xl font-bold text-white">0 FCFA</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-4">
            <span className="material-symbols-outlined text-lime-400">savings</span>
            <p className="text-xs text-slate-400 mt-2">Épargne Projet</p>
            <p className="text-xl font-bold text-white">850K <span className="text-xs text-lime-400">/ 2M</span></p>
          </div>
        </div>
      </div>

      {/* Modales (inchangées) */}
      {depositModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDepositModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">Approvisionner le wallet</h2>
              <button onClick={() => setDepositModal(false)} className="text-slate-400 hover:text-white transition">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Montant (FCFA)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-lime-500 outline-none text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="6XXXXXXXX"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Service</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="notchpay">Paiement par carte / Mobile Money (NotchPay)</option>
                </select>
              </div>
              <button
                onClick={handleDeposit}
                disabled={loadingAction}
                className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold rounded-xl transition disabled:opacity-50"
              >
                {loadingAction ? 'Traitement...' : 'Continuer vers le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {withdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setWithdrawModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">Retirer des fonds</h2>
              <button onClick={() => setWithdrawModal(false)} className="text-slate-400 hover:text-white transition">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Montant (FCFA)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
                <p className="text-xs text-slate-400 mt-1">Maximum : {wallet?.balance?.toLocaleString()} FCFA</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone Mobile Money</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="6XXXXXXXX"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Opérateur</label>
                <select
                  value={withdrawChannel}
                  onChange={(e) => setWithdrawChannel(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="mtn">MTN Mobile Money</option>
                  <option value="orange">Orange Money</option>
                </select>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={loadingAction}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition disabled:opacity-50"
              >
                {loadingAction ? 'Envoi...' : 'Demander le retrait'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return (
    <VendorLayout>
      <WalletContent />
    </VendorLayout>
  );
}