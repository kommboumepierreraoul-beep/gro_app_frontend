'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DisputeChat from '@/components/DisputeChat';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Package, Clock, CheckCircle, XCircle, MessageCircle, ChevronLeft, Flag, FileText, AlertTriangle, Info, Plus, Settings } from 'lucide-react';
import { storageUrl } from '@/lib/storage';
import Link from 'next/link';

function getInitials(firstname?: string, lastname?: string) {
  const f = firstname?.charAt(0) || '';
  const l = lastname?.charAt(0) || '';
  return (f + l).toUpperCase() || '?';
}

const STATUS: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  pending:           { label: 'En attente',          color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   Icon: Clock },
  negotiation:       { label: 'Discussion en cours',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',     Icon: MessageCircle },
  escalated:         { label: "Phase d'arbitrage",    color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200', Icon: Flag },
  resolved_amicably: { label: 'Résolu à l\'amiable',  color: 'text-green-700',   bg: 'bg-green-50 border-green-200',   Icon: CheckCircle },
  resolved_by_admin: { label: 'Résolu par l\'admin',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CheckCircle },
  refunded:          { label: 'Remboursé',            color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CheckCircle },
  replaced:          { label: 'Produit renvoyé',      color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200', Icon: Package },
  dismissed:         { label: 'Rejeté',               color: 'text-red-700',     bg: 'bg-red-50 border-red-200',       Icon: XCircle },
};

const REASONS: Record<string, string> = {
  not_received:  'Commande non reçue',
  damaged:       'Produit endommagé',
  wrong_product: 'Mauvais produit reçu',
  other:         'Autre problème',
};

export default function ClientDisputeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [closeResolution, setCloseResolution] = useState('refund');
  const [closeAmount, setCloseAmount] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/disputes/${id}`),
      api.get('/auth/profile'),
    ]).then(([dRes, uRes]) => {
      setDispute(dRes.data.data);
      setCurrentUser(uRes.data?.user ?? uRes.data?.data ?? uRes.data);
    }).catch(() => {
      toast.error('Litige introuvable');
      router.push('/disputes');
    }).finally(() => setLoading(false));
  }, []);

  const handleEscalate = async () => {
    if (!confirm('Transmettre ce litige à l\'administrateur ? Il prendra une décision finale.')) return;
    setEscalating(true);
    try {
      await api.post(`/disputes/${dispute.id}/escalate`);
      toast.success('Litige transmis à l\'administrateur');
      setDispute((d: any) => ({ ...d, status: 'escalated', mode: 'admin' }));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setEscalating(false); }
  };

  const handleCloseAmicably = async () => {
    if (closeResolution === 'partial_refund' && !closeAmount) {
      toast.error('Entrez un montant');
      return;
    }
    setClosing(true);
    try {
      await api.post(`/disputes/${dispute.id}/close-amicably`, {
        resolution: closeResolution,
        refund_amount: closeResolution === 'partial_refund' ? parseFloat(closeAmount) : undefined,
      });
      toast.success('Litige clôturé à l\'amiable !');
      router.push('/disputes');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setClosing(false); }
  };

  if (loading) return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
  );

  if (!dispute) return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">Litige non trouvé</div>
  );

  const cfg = STATUS[dispute.status] ?? STATUS.pending;
  const canEscalate = dispute.mode === 'amiable' && ['pending', 'negotiation'].includes(dispute.status);
  const canClose = dispute.mode === 'amiable' && dispute.status === 'negotiation';
  const isResolved = ['resolved_amicably', 'resolved_by_admin', 'refunded', 'replaced', 'dismissed'].includes(dispute.status);
  const isEscalated = dispute.status === 'escalated';

  // Étapes du suivi de dossier
  const steps = [
    { key: 'opened', label: 'Litige initié', done: true, date: dispute.created_at },
    { key: 'discussion', label: 'Phase de discussion', done: true, date: dispute.created_at },
    { key: 'arbitration', label: 'Arbitrage Agripulse', done: isEscalated || isResolved, active: isEscalated },
    { key: 'resolved', label: 'Litige résolu', done: isResolved, date: isResolved ? dispute.updated_at : null },
  ];

  let imgSrc = '';
  try {
    const imgs = JSON.parse(dispute.order?.items?.[0]?.product?.images || '[]');
    imgSrc = imgs[0] ? `http://localhost:8000${imgs[0]}` : '';
  } catch {}

  return (
      <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-8">

        {/* Header */}
        <header className="sticky top-16 z-30 rounded-t-2xl border-b border-emerald-100/50 bg-white/85 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <Link href="/disputes" className="flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-900 transition-colors flex-shrink-0">
                <ChevronLeft size={22} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-slate-800 truncate">Détails du Litige : {dispute.order?.items?.[0]?.product?.name || `Litige #${dispute.id}`}</h1>
                <p className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 mt-0.5 ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
                  {cfg.label}
                </p>
              </div>
            </div>
            {dispute.seller && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 pl-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex-shrink-0">
                <img
                  src={(dispute.seller?.profile?.avatar_url && !dispute.seller.profile.avatar_url.includes("default-avatar")) ? dispute.seller.profile.avatar_url : `https://ui-avatars.com/api/?background=0D9488&color=fff&bold=true&name=${encodeURIComponent((dispute.seller?.firstname || "") + " " + (dispute.seller?.lastname || ""))}`}
                  className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                  alt=""
                />
                Vendeur : {dispute.seller?.firstname} {dispute.seller?.lastname}
              </div>
            )}
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Colonne gauche — Infos commande */}
          <aside className="lg:col-span-3 flex flex-col gap-5 order-1 lg:order-1">
            <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm shadow-emerald-100">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Informations Commande</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {imgSrc && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-50 flex-shrink-0">
                      <img src={imgSrc} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 uppercase font-bold">Produit</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{dispute.order?.items?.[0]?.product?.name || 'Produit'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-bold">Montant bloqué</p>
                  <p className="text-xl font-bold text-emerald-700">{Number(dispute.order?.total_amount || 0).toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-[11px] text-slate-400 italic">Fonds sécurisés par Agripulse</p>
                </div>
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Date Achat</p>
                    <p className="text-xs font-bold text-slate-700">{new Date(dispute.order?.created_at || dispute.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Commande</p>
                    <p className="text-xs font-bold text-slate-700">#{dispute.order?.order_number}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm shadow-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="font-bold text-slate-800 text-sm">Motif du litige</h3>
              </div>
              <div className="bg-red-50/60 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-700 mb-1">{REASONS[dispute.reason] ?? dispute.reason}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{dispute.description}</p>
              </div>
              {dispute.attachments?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {dispute.attachments.map((url: string, i: number) => (
                    <img key={i} src={storageUrl(url)} className="w-full h-16 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition" onClick={() => window.open(storageUrl(url), '_blank')} />
                  ))}
                </div>
              )}
            </section>

            {isEscalated && (
              <section className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase mb-1">Intervention médiateur</p>
                  <p className="text-xs text-blue-700 leading-relaxed">L'équipe Agripulse examine les preuves. Réponse attendue sous 24h.</p>
                </div>
              </section>
            )}

            {dispute.seller_response && (
              <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm shadow-emerald-100 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm">Réponse du vendeur</h3>
                <p className="text-sm text-slate-600 bg-blue-50 rounded-xl p-3 border border-blue-100 leading-relaxed">{dispute.seller_response}</p>
                {dispute.seller_attachments?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {dispute.seller_attachments.map((url: string, i: number) => (
                      <img key={i} src={storageUrl(url)} className="w-full h-16 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </section>
            )}
          </aside>

          {/* Colonne centrale — Chat */}
          <section className="lg:col-span-6 order-3 lg:order-2 flex flex-col gap-5">
            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm shadow-emerald-100 overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
              <div className="px-5 py-4 border-b border-emerald-100/50 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={(dispute.seller?.profile?.avatar_url && !dispute.seller.profile.avatar_url.includes("default-avatar")) ? dispute.seller.profile.avatar_url : `https://ui-avatars.com/api/?background=0D9488&color=fff&bold=true&size=64&name=${encodeURIComponent((dispute.seller?.firstname || "") + " " + (dispute.seller?.lastname || ""))}`}
                    className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{dispute.seller?.firstname} {dispute.seller?.lastname}</p>
                    <p className="text-[11px] text-slate-400">Vendeur</p>
                  </div>
                </div>
                <Settings size={16} className="text-slate-400" />
              </div>
              {currentUser && (
                <DisputeChat disputeId={dispute.id} currentUserId={currentUser.id} isAdmin={isResolved} />
              )}
            </div>

            {/* Décision admin */}
            {dispute.admin_notes && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                <h3 className="text-sm font-bold text-emerald-800 mb-2">Décision de l'administration</h3>
                <p className="text-sm text-emerald-700 leading-relaxed">{dispute.admin_notes}</p>
                {dispute.refund_amount && (
                  <p className="text-sm font-bold text-emerald-700 mt-2">
                    Remboursement : {Number(dispute.refund_amount).toLocaleString('fr-FR')} FCFA
                  </p>
                )}
              </div>
            )}

            {/* Bannière remboursement */}
            {isResolved && dispute.refund_amount && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Remboursement crédité sur votre portefeuille</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-0.5">{Number(dispute.refund_amount).toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Disponible immédiatement dans votre portefeuille</p>
                </div>
              </div>
            )}
          </section>

          {/* Colonne droite — Suivi + Actions */}
          <aside className="lg:col-span-3 flex flex-col gap-5 order-2 lg:order-3">

            {/* Timeline suivi dossier */}
            <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm shadow-emerald-100">
              <h3 className="font-bold text-slate-800 text-sm mb-5">Suivi du Dossier</h3>
              <div className="space-y-5">
                {steps.map((s, i) => (
                  <div key={s.key} className="flex items-start gap-3 relative">
                    {i < steps.length - 1 && (
                      <div className={`absolute left-[11px] top-6 w-0.5 h-full ${s.done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      s.done ? 'bg-emerald-600 text-white' : s.active ? 'bg-orange-400 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {s.done ? <CheckCircle size={13} /> : s.active ? <Clock size={13} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${s.done || s.active ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {s.date ? new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ', ' + new Date(s.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          : s.active ? "En cours d'examen" : 'En attente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pièces jointes */}
            <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm shadow-emerald-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-sm">Pièces Jointes</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {(dispute.attachments?.length || 0) + (dispute.seller_attachments?.length || 0)} fichiers
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[...(dispute.attachments || []), ...(dispute.seller_attachments || [])].slice(0, 3).map((url: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer" onClick={() => window.open(storageUrl(url), '_blank')}>
                    <img src={storageUrl(url)} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="aspect-square rounded-xl border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-1 bg-emerald-50/40 text-emerald-600">
                  <Plus size={18} />
                  <span className="text-[10px] font-bold">AJOUTER</span>
                </div>
              </div>
            </section>

            {/* Actions */}
            {!isResolved && (canClose || canEscalate) && (
              <section className="space-y-3">
                {canClose && (
                  <div>
                    <button onClick={() => setShowCloseForm(!showCloseForm)}
                      className="w-full py-3.5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Marquer comme résolu
                    </button>
                    {showCloseForm && (
                      <div className="mt-3 space-y-3 p-4 bg-white/75 backdrop-blur-xl rounded-xl border border-white/60 shadow-sm">
                        <select value={closeResolution} onChange={e => setCloseResolution(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                          <option value="refund">Remboursement total</option>
                          <option value="partial_refund">Remboursement partiel</option>
                          <option value="replace">Renvoi du produit</option>
                          <option value="dismissed">Aucun accord nécessaire</option>
                        </select>
                        {closeResolution === 'partial_refund' && (
                          <input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)}
                            placeholder="Montant (FCFA)" className="w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                        )}
                        <button onClick={handleCloseAmicably} disabled={closing}
                          className="w-full py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all">
                          {closing ? 'Traitement...' : "Confirmer l'accord"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {canEscalate && (
                  <button onClick={handleEscalate} disabled={escalating}
                    className="w-full py-3 px-4 bg-white border-2 border-orange-200 text-orange-700 text-sm font-bold rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
                    <Flag size={15} />
                    {escalating ? 'Traitement...' : 'Contacter le médiateur'}
                  </button>
                )}
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  La résolution libère les fonds vers le compte du vendeur après accord.
                </p>
              </section>
            )}
          </aside>
        </main>
      </div>
  );
}
