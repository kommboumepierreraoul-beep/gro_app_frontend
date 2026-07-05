'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { AlertCircle, Package, ChevronRight, Clock, CheckCircle, XCircle, MessageCircle, Plus, Flag } from 'lucide-react';

const STATUS: Record<string, { label: string; dot: string; bg: string; Icon: any }> = {
  pending:           { label: 'En attente',          dot: 'bg-amber-400',   bg: 'bg-amber-50 text-amber-700 border-amber-200',   Icon: Clock },
  negotiation:       { label: 'Discussion en cours', dot: 'bg-blue-400',    bg: 'bg-blue-50 text-blue-700 border-blue-200',       Icon: MessageCircle },
  escalated:         { label: 'Transmis à l\'admin', dot: 'bg-orange-400',  bg: 'bg-orange-50 text-orange-700 border-orange-200', Icon: Flag },
  resolved_amicably: { label: 'Résolu à l\'amiable', dot: 'bg-green-400',   bg: 'bg-green-50 text-green-700 border-green-200',    Icon: CheckCircle },
  resolved_by_admin: { label: 'Résolu par l\'admin', dot: 'bg-emerald-400', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle },
  refunded:          { label: 'Remboursé',           dot: 'bg-emerald-400', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle },
  replaced:          { label: 'Produit renvoyé',     dot: 'bg-purple-400',  bg: 'bg-purple-50 text-purple-700 border-purple-200', Icon: Package },
  dismissed:         { label: 'Rejeté',              dot: 'bg-red-400',     bg: 'bg-red-50 text-red-700 border-red-200',           Icon: XCircle },
};

const REASONS: Record<string, string> = {
  not_received: 'Non reçue', damaged: 'Endommagé',
  wrong_product: 'Mauvais produit', other: 'Autre',
};

export default function ClientDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/disputes')
      .then(res => setDisputes(res.data.data || []))
      .catch(() => toast.error('Impossible de charger vos litiges'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? disputes : disputes.filter(d => d.status === filter);

  const counts = {
    pending: disputes.filter(d => d.status === 'pending').length,
    negotiation: disputes.filter(d => d.status === 'negotiation').length,
    escalated: disputes.filter(d => d.status === 'escalated').length,
  };

  return (
      <div className="mx-auto max-w-5xl space-y-6 py-5 sm:py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mes litiges</h1>
            <p className="text-slate-500 text-sm mt-1">Suivez vos réclamations en cours</p>
          </div>
          <Link href="/orders" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition">
            <Plus size={16} /> Signaler un problème
          </Link>
        </div>

        {/* Stats */}
        {disputes.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium">En attente</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{counts.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">En discussion</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{counts.negotiation}</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <p className="text-xs text-orange-600 font-medium">Chez l'admin</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">{counts.escalated}</p>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'negotiation', 'escalated', 'resolved_amicably', 'refunded', 'dismissed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
              }`}>
              {f === 'all' ? 'Tous' : STATUS[f]?.label ?? f}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse border border-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun litige trouvé</p>
            <Link href="/orders" className="inline-block mt-4 text-sm text-emerald-600 hover:underline">
              Voir mes commandes →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(d => {
              const cfg = STATUS[d.status] ?? STATUS.pending;
              const { Icon } = cfg;
              return (
                <Link href={`/disputes/${d.id}`} key={d.id} className="block group">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-mono text-sm font-semibold text-slate-700">#{d.order?.order_number}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${cfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">
                            {REASONS[d.reason] ?? d.reason}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{d.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="font-bold text-emerald-600 text-sm">
                          {Number(d.order?.total_amount).toLocaleString('fr-FR')} FCFA
                        </span>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
  );
}
