'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import VendorLayout from '@/components/layouts/VendorLayout';
import DisputeChat from '@/components/DisputeChat';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Package, Clock, CheckCircle, XCircle, MessageCircle, ChevronLeft, Flag, HelpCircle, Scale, Sparkles, Swords, Wallet, RotateCcw, Ban, Send, ShieldCheck, Gavel } from 'lucide-react';
import { storageUrl } from '@/lib/storage';
import Link from 'next/link';

const STATUS: Record<string, { label: string; color: string; bg: string; ring: string; Icon: any }> = {
  pending:           { label: 'En attente',           color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     ring: 'ring-amber-300',   Icon: Clock },
  negotiation:       { label: 'Discussion en cours',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       ring: 'ring-blue-300',    Icon: MessageCircle },
  escalated:         { label: 'Escaladé — à traiter', color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200',   ring: 'ring-orange-300',  Icon: Flag },
  resolved_amicably: { label: 'Résolu à l\'amiable',  color: 'text-green-700',   bg: 'bg-green-50 border-green-200',     ring: 'ring-green-300',   Icon: CheckCircle },
  resolved_by_admin: { label: 'Résolu par l\'admin',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', ring: 'ring-emerald-300', Icon: CheckCircle },
  refunded:          { label: 'Remboursé',            color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', ring: 'ring-emerald-300', Icon: CheckCircle },
  replaced:          { label: 'Produit renvoyé',      color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200',   ring: 'ring-purple-300',  Icon: Package },
  dismissed:         { label: 'Rejeté',               color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         ring: 'ring-red-300',     Icon: XCircle },
};

const REASONS: Record<string, string> = {
  not_received:  'Commande non reçue',
  damaged:       'Produit endommagé',
  wrong_product: 'Mauvais produit reçu',
  other:         'Autre problème',
};

function initials(first?: string, last?: string) {
  return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase() || '?';
}

export default function AdminDisputeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [question, setQuestion] = useState('');
  const [resolving, setResolving] = useState(false);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/disputes/${id}`),
      api.get("/user"),
    ]).then(([dRes, uRes]) => {
      setDispute(dRes.data.data);
      setCurrentUser(uRes.data);
    }).catch(() => {
      toast.error("Litige introuvable");
      router.push("/admin/disputes");
    }).finally(() => setLoading(false));
  }, []);

  const handleResolve = async () => {
    if (!resolution) { toast.error('Choisissez une résolution'); return; }
    if (resolution === 'partial_refund' && (!refundAmount || parseFloat(refundAmount) <= 0)) {
      toast.error('Montant invalide'); return;
    }
    setResolving(true);
    try {
      const payload: any = { resolution, admin_notes: adminNotes };
      if (resolution === 'partial_refund') payload.refund_amount = parseFloat(refundAmount);
      await api.post(`/disputes/${dispute.id}/resolve`, payload);
      toast.success('Décision appliquée — les deux parties ont été notifiées');
      router.push('/admin/disputes');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setResolving(false); }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setAsking(true);
    try {
      await api.post(`/disputes/${dispute.id}/admin-question`, { question });
      toast.success('Question envoyée au vendeur');
      setQuestion('');
      const res = await api.get(`/disputes/${id}`);
      setDispute(res.data.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setAsking(false); }
  };

  if (loading) return (
    <VendorLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <Scale size={18} className="absolute inset-0 m-auto text-emerald-600" />
        </div>
      </div>
    </VendorLayout>
  );

  if (!dispute) return (
    <VendorLayout>
      <div className="min-h-screen flex items-center justify-center text-slate-500">Litige non trouvé</div>
    </VendorLayout>
  );

  const cfg = STATUS[dispute.status] ?? STATUS.pending;
  const { Icon } = cfg;
  const isResolved = ['resolved_amicably', 'resolved_by_admin', 'refunded', 'replaced', 'dismissed'].includes(dispute.status);
  const canResolve = dispute.status === 'escalated' && dispute.mode === 'admin';

  const resolutionOptions = [
    { value: 'refund', label: 'Remboursement total', IconC: Wallet, color: 'emerald', desc: `${Number(dispute.order?.total_amount).toLocaleString('fr-FR')} FCFA` },
    { value: 'partial_refund', label: 'Remboursement partiel', IconC: Wallet, color: 'blue', desc: 'Montant à définir' },
    { value: 'replace', label: 'Renvoi du produit', IconC: RotateCcw, color: 'purple', desc: 'Nouveau produit' },
    { value: 'dismissed', label: 'Rejeter le litige', IconC: Ban, color: 'red', desc: 'Pas de remboursement' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500 bg-emerald-50 shadow-emerald-200/60 text-emerald-700',
    blue: 'border-blue-500 bg-blue-50 shadow-blue-200/60 text-blue-700',
    purple: 'border-purple-500 bg-purple-50 shadow-purple-200/60 text-purple-700',
    red: 'border-red-500 bg-red-50 shadow-red-200/60 text-red-700',
  };
  const iconColorMap: Record<string, string> = {
    emerald: 'bg-emerald-600 text-white', blue: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white', red: 'bg-red-600 text-white',
  };

  return (
    <VendorLayout>
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

        {/* Header premium */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/60 px-4 md:px-6 py-4 shadow-sm">
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <Link href="/admin/disputes" className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm transition-all flex-shrink-0">
                <ChevronLeft size={20} />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base md:text-lg font-bold text-slate-800 truncate">Litige {dispute.order?.items?.[0]?.product?.name || `#${dispute.id}`}</h1>
                  {canResolve && <Sparkles size={14} className="text-orange-500 animate-pulse flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400">Commande #{dispute.order?.order_number} · <span className="font-bold text-emerald-700">{Number(dispute.order?.total_amount).toLocaleString('fr-FR')} FCFA</span></p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border whitespace-nowrap shadow-sm ${cfg.bg} ${cfg.color} ${canResolve ? `ring-2 ${cfg.ring} animate-pulse` : ''}`}>
              <Icon size={13} /> {cfg.label}
            </span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

          {canResolve && (
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-5 py-4 text-sm text-white flex items-center gap-3 shadow-lg shadow-orange-200">
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
              <Gavel size={20} className="flex-shrink-0 relative z-10" />
              <span className="relative z-10 font-semibold">Ce litige a été escaladé et attend votre décision finale d'arbitre.</span>
            </div>
          )}

          {/* Face-à-face client vs vendeur */}
          <div className="relative">
            <div className="hidden md:flex absolute inset-0 items-center justify-center z-10 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-emerald-100">
                <Swords size={20} className="text-emerald-600" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {/* Côté client */}
              <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-emerald-100/50 space-y-4 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <img
                    src={(dispute.user?.profile?.avatar_url && !dispute.user.profile.avatar_url.includes("default-avatar")) ? dispute.user.profile.avatar_url : `https://ui-avatars.com/api/?background=0d9488&color=fff&bold=true&size=64&name=${encodeURIComponent((dispute.user?.firstname || "") + " " + (dispute.user?.lastname || ""))}`}
                    className="w-12 h-12 rounded-full object-cover shadow-md flex-shrink-0"
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Client</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{dispute.user?.firstname} {dispute.user?.lastname}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 mb-1">Motif</p>
                  <span className="inline-block px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">{REASONS[dispute.reason] ?? dispute.reason}</span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5">Description</p>
                  <p className="text-sm text-slate-600 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 leading-relaxed">{dispute.description}</p>
                </div>
                {dispute.attachments?.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 mb-2">Preuves</p>
                    <div className="grid grid-cols-3 gap-2">
                      {dispute.attachments.map((url: string, i: number) => (
                        <img key={i} src={storageUrl(url)} className="w-full h-20 object-cover rounded-xl cursor-zoom-in hover:scale-105 transition-transform shadow-sm" onClick={() => window.open(storageUrl(url), '_blank')} />
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Côté vendeur */}
              <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-emerald-100/50 space-y-4 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <img
                    src={(dispute.seller?.profile?.avatar_url && !dispute.seller.profile.avatar_url.includes("default-avatar")) ? dispute.seller.profile.avatar_url : `https://ui-avatars.com/api/?background=2563eb&color=fff&bold=true&size=64&name=${encodeURIComponent((dispute.seller?.firstname || "") + " " + (dispute.seller?.lastname || ""))}`}
                    className="w-12 h-12 rounded-full object-cover shadow-md flex-shrink-0"
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Vendeur</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{dispute.seller?.firstname} {dispute.seller?.lastname}</p>
                  </div>
                </div>
                {dispute.seller_response ? (
                  <>
                    <div>
                      <p className="text-[11px] text-slate-400 mb-1.5">Réponse</p>
                      <p className="text-sm text-slate-600 bg-blue-50 rounded-2xl p-3.5 border border-blue-100 leading-relaxed">{dispute.seller_response}</p>
                    </div>
                    {dispute.seller_attachments?.length > 0 && (
                      <div>
                        <p className="text-[11px] text-slate-400 mb-2">Preuves</p>
                        <div className="grid grid-cols-3 gap-2">
                          {dispute.seller_attachments.map((url: string, i: number) => (
                            <img key={i} src={storageUrl(url)} className="w-full h-20 object-cover rounded-xl cursor-zoom-in hover:scale-105 transition-transform shadow-sm" onClick={() => window.open(storageUrl(url), '_blank')} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-2 animate-pulse">
                      <Clock size={18} className="text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">En attente de réponse...</p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                    <HelpCircle size={13} className="text-blue-500" /> Poser une question au vendeur
                  </p>
                  <div className="flex gap-2">
                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
                      placeholder="Demandez des précisions..."
                      className="flex-1 bg-slate-50 border-2 border-transparent rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" />
                    <button onClick={handleAskQuestion} disabled={asking || !question.trim()}
                      className="px-4 py-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5">
                      <Send size={12} /> {asking ? '...' : 'Envoyer'}
                    </button>
                  </div>
                  {dispute.admin_question && (
                    <p className="text-xs text-blue-700 mt-2.5 bg-blue-50 border border-blue-100 p-2.5 rounded-xl">
                      Question posée : {dispute.admin_question}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Chat immersif */}
          <section className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-lg shadow-emerald-100/50 overflow-hidden flex flex-col h-[500px]">
            <div className="px-5 py-4 border-b border-emerald-100/50 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={15} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Historique de la discussion</h2>
                <p className="text-[10px] text-slate-400">Vous intervenez en tant qu'arbitre AgriConnect</p>
              </div>
            </div>
            <DisputeChat disputeId={dispute.id} currentUserId={currentUser?.id || 0} isAdmin={true} />
          </section>

          {/* Panel résolution — cartes interactives */}
          {canResolve && (
            <section className="relative bg-white/80 backdrop-blur-2xl border-2 border-orange-200 rounded-3xl shadow-xl shadow-orange-100/50 p-6 md:p-8 space-y-6">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Gavel size={14} className="text-white" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <Scale size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Votre décision finale</h2>
                  <p className="text-xs text-slate-500">Définitive — notifiée aux deux parties par email</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {resolutionOptions.map(opt => {
                  const active = resolution === opt.value;
                  return (
                    <button key={opt.value} onClick={() => setResolution(opt.value)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                        active ? `${colorMap[opt.color]} shadow-lg scale-[1.03]` : 'border-slate-200 bg-white hover:border-slate-300 hover:scale-[1.01]'
                      }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-all ${active ? iconColorMap[opt.color] : 'bg-slate-100 text-slate-400'}`}>
                        <opt.IconC size={16} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">{opt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{opt.desc}</p>
                      {active && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {resolution === 'partial_refund' && (
                <div className="animate-[fadeIn_0.3s_ease-in]">
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">Montant du remboursement (FCFA)</label>
                  <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                    placeholder="Ex: 5000"
                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all" />
                  <p className="text-xs text-slate-400 mt-1.5">Max : {Number(dispute.order?.total_amount).toLocaleString('fr-FR')} FCFA</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Justification de la décision</label>
                <textarea rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Expliquez votre décision aux deux parties..."
                  className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all" />
              </div>

              <button onClick={handleResolve} disabled={resolving || !resolution}
                className="w-full py-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-300/50 hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2.5">
                {resolving ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Application de la décision...</>
                ) : (
                  <><Gavel size={18} /> Appliquer la décision finale</>
                )}
              </button>
            </section>
          )}

          {/* Déjà résolu */}
          {isResolved && dispute.admin_notes && (
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-6 shadow-lg shadow-emerald-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <CheckCircle size={18} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-emerald-800">Décision appliquée</h3>
              </div>
              <p className="text-sm text-emerald-700 leading-relaxed">{dispute.admin_notes}</p>
              {dispute.refund_amount && (
                <p className="text-lg font-bold text-emerald-700 mt-3">
                  💰 Remboursement : {Number(dispute.refund_amount).toLocaleString('fr-FR')} FCFA
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </VendorLayout>
  );
}
