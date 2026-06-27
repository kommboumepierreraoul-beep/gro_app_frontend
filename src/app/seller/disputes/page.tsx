'use client';

import { useState, useEffect } from 'react';
import VendorLayout from '@/components/layouts/VendorLayout';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { AlertCircle, Package, ChevronRight, ChevronLeft, Search, Bell, ShoppingCart, ClipboardList, Timer, CheckCircle2, Wallet, Filter, Download } from 'lucide-react';

const STATUS: Record<string, { label: string; badge: string }> = {
  pending:           { label: 'En attente',  badge: 'bg-red-100 text-red-700' },
  negotiation:       { label: 'Discussion',  badge: 'bg-blue-100 text-blue-700' },
  escalated:         { label: 'Transmis',    badge: 'bg-orange-100 text-orange-700' },
  resolved_amicably: { label: 'Résolu',      badge: 'bg-emerald-100 text-emerald-700' },
  resolved_by_admin: { label: 'Résolu',      badge: 'bg-emerald-100 text-emerald-700' },
  refunded:          { label: 'Remboursé',   badge: 'bg-emerald-100 text-emerald-700' },
  replaced:          { label: 'Remplacé',    badge: 'bg-purple-100 text-purple-700' },
  dismissed:         { label: 'Clos',        badge: 'bg-slate-200 text-slate-600' },
};

const PROGRESS: Record<string, number> = {
  pending: 15, negotiation: 50, escalated: 70,
  resolved_amicably: 100, resolved_by_admin: 100, refunded: 100, replaced: 100, dismissed: 100,
};

const REASONS: Record<string, string> = {
  not_received: 'Non reçue', damaged: 'Endommagé',
  wrong_product: 'Mauvais produit', other: 'Autre',
};

const PAGE_SIZE = 8;

export default function SellerDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/disputes/seller')
      .then(res => setDisputes(res.data.data || []))
      .catch(() => toast.error('Impossible de charger les litiges'))
      .finally(() => setLoading(false));
  }, []);

  const resolvedStatuses = ['resolved_amicably', 'resolved_by_admin', 'refunded', 'replaced', 'dismissed'];
  const needsAction = disputes.filter(d => d.status === 'pending').length;
  const resolvedCount = disputes.filter(d => resolvedStatuses.includes(d.status)).length;
  const refundedTotal = disputes
    .filter(d => d.status === 'refunded')
    .reduce((sum, d) => sum + Number(d.order?.total_amount || 0), 0);

  let filtered = filter === 'all' ? disputes : disputes.filter(d => d.status === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d =>
      d.order?.order_number?.toLowerCase().includes(q) ||
      d.user?.firstname?.toLowerCase().includes(q) ||
      d.user?.lastname?.toLowerCase().includes(q) ||
      d.order?.items?.[0]?.product?.name?.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToFilter = (f: string) => { setFilter(f); setPage(1); };

  const exportCsv = () => {
    const header = ['Commande', 'Date', 'Client', 'Motif', 'Montant', 'Statut'];
    const rows = filtered.map(d => [
      d.order?.order_number ?? '',
      new Date(d.created_at).toLocaleDateString('fr-FR'),
      `${d.user?.firstname ?? ''} ${d.user?.lastname ?? ''}`.trim(),
      REASONS[d.reason] ?? d.reason,
      d.order?.total_amount ?? '',
      STATUS[d.status]?.label ?? d.status,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'litiges.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <VendorLayout>
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#e6fff4] p-4 sm:p-6 lg:p-8">

        {/* Header local */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Gestion des Litiges</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white border border-emerald-900/10 rounded-full pl-10 pr-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Rechercher un litige..."
                type="text"
              />
            </div>
            <button className="text-slate-500 hover:text-emerald-700 transition-colors p-2 bg-white rounded-full border border-emerald-900/10">
              <Bell size={18} />
            </button>
            <button className="text-slate-500 hover:text-emerald-700 transition-colors p-2 bg-white rounded-full border border-emerald-900/10">
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-5 md:p-6 rounded-3xl border-l-[6px] border-l-emerald-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Litiges</p>
              <ClipboardList size={20} className="text-emerald-700" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{disputes.length}</p>
            <p className="text-xs text-slate-500 mt-1">Toutes réclamations</p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-3xl border-l-[6px] border-l-red-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">En attente</p>
              <Timer size={20} className="text-red-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{needsAction}</p>
            <p className="text-xs text-red-600 font-bold mt-1">{needsAction > 0 ? 'Nécessite action' : 'Rien à traiter'}</p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-3xl border-l-[6px] border-l-emerald-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Résolus</p>
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{resolvedCount}</p>
            <p className="text-xs text-emerald-600 font-bold mt-1">
              {disputes.length > 0 ? Math.round((resolvedCount / disputes.length) * 100) : 0}% de réussite
            </p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-3xl border-l-[6px] border-l-slate-400 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Remboursé</p>
              <Wallet size={20} className="text-slate-500" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{refundedTotal.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-xs text-slate-500 mt-1">Montant total</p>
          </div>
        </section>

        {/* Table card */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-emerald-900/10 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">Historique détaillé des réclamations</h3>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 whitespace-nowrap">
                <Filter size={14} /> <span className="hidden sm:inline">Filtrer</span>
              </button>
              <button onClick={exportCsv} className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 whitespace-nowrap">
                <Download size={14} /> <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Chips de filtre statut */}
          <div className="px-5 md:px-6 py-3 flex gap-2 flex-wrap border-b border-slate-100">
            {['all', 'pending', 'negotiation', 'escalated', 'resolved_amicably', 'dismissed'].map(f => (
              <button key={f} onClick={() => goToFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-400'
                }`}>
                {f === 'all' ? 'Tous' : STATUS[f]?.label ?? f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Aucun litige</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Produit</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">N° Commande</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date & Client</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Montant</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Statut</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map(d => {
                      const cfg = STATUS[d.status] ?? STATUS.pending;
                      const progress = PROGRESS[d.status] ?? 15;
                      const isResolved = resolvedStatuses.includes(d.status);
                      let imgSrc = '';
                      try {
                        const imgs = JSON.parse(d.order?.items?.[0]?.product?.images || '[]');
                        imgSrc = imgs[0] ? `http://localhost:8000${imgs[0]}` : '';
                      } catch {}
                      return (
                        <tr key={d.id} className={`hover:bg-emerald-50/40 transition-colors ${isResolved ? 'opacity-90' : ''}`}>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl overflow-hidden bg-emerald-100 flex-shrink-0 flex items-center justify-center ${isResolved ? 'grayscale' : ''}`}>
                                {imgSrc ? <img src={imgSrc} className="w-full h-full object-cover" /> : <Package size={18} className="text-emerald-400" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{d.order?.items?.[0]?.product?.name || 'Produit'}</p>
                                <div className="w-32 mt-2">
                                  <div className="flex justify-between text-[10px] mb-1 font-bold">
                                    <span className="text-slate-400">Progrès</span>
                                    <span className={isResolved ? 'text-emerald-700' : 'text-emerald-600'}>{progress}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-600" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md">#{d.order?.order_number}</span>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-sm font-bold text-slate-800">{new Date(d.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            <p className="text-xs text-slate-500">{d.user?.firstname} {d.user?.lastname}</p>
                          </td>
                          <td className="px-6 py-6 font-extrabold text-slate-900 whitespace-nowrap">
                            {Number(d.order?.total_amount || 0).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.badge}`}>{cfg.label}</span>
                          </td>
                          <td className="px-6 py-6">
                            <Link href={`/seller/disputes/${d.id}`}
                              className={d.status === 'pending'
                                ? 'inline-block bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-800 transition-all'
                                : isResolved
                                  ? 'inline-block text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold underline decoration-dotted transition-all'
                                  : 'inline-block text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition-all'
                              }>
                              {d.status === 'pending' ? 'Répondre' : isResolved ? 'Historique' : 'Consulter'}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {paginated.map(d => {
                  const cfg = STATUS[d.status] ?? STATUS.pending;
                  const progress = PROGRESS[d.status] ?? 15;
                  const isResolved = resolvedStatuses.includes(d.status);
                  let imgSrc = '';
                  try {
                    const imgs = JSON.parse(d.order?.items?.[0]?.product?.images || '[]');
                    imgSrc = imgs[0] ? `http://localhost:8000${imgs[0]}` : '';
                  } catch {}
                  return (
                    <Link href={`/seller/disputes/${d.id}`} key={d.id} className="block p-4 active:bg-emerald-50/60">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-11 h-11 rounded-xl overflow-hidden bg-emerald-100 flex-shrink-0 flex items-center justify-center ${isResolved ? 'grayscale' : ''}`}>
                          {imgSrc ? <img src={imgSrc} className="w-full h-full object-cover" /> : <Package size={16} className="text-emerald-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{d.order?.items?.[0]?.product?.name || 'Produit'}</p>
                          <span className="text-xs font-mono text-slate-400">#{d.order?.order_number}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <div className="w-full mb-2">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{d.user?.firstname} {d.user?.lastname} • {new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                        <span className="font-bold text-emerald-700">{Number(d.order?.total_amount || 0).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="p-5 md:p-6 flex items-center justify-between gap-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Affichage de {(page - 1) * PAGE_SIZE + 1} à {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} litiges
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-30">
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        p === page ? 'bg-emerald-700 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-30">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
