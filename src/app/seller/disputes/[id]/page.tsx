'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DisputeChat from '@/components/DisputeChat';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, XCircle, MessageCircle, ChevronLeft, Flag, Upload, X, Package, ShieldQuestion, Eye } from 'lucide-react';
import { storageUrl } from '@/lib/storage';
import Link from 'next/link';

const STATUS: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  pending:           { label: 'En attente de réponse', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   Icon: Clock },
  negotiation:       { label: 'Discussion en cours',   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',     Icon: MessageCircle },
  escalated:         { label: 'Transmis à l\'admin',   color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200', Icon: Flag },
  resolved_amicably: { label: 'Résolu à l\'amiable',   color: 'text-green-700',   bg: 'bg-green-50 border-green-200',   Icon: CheckCircle },
  resolved_by_admin: { label: 'Résolu par l\'admin',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CheckCircle },
  refunded:          { label: 'Remboursé',             color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CheckCircle },
  replaced:          { label: 'Produit renvoyé',       color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200', Icon: Package },
  dismissed:         { label: 'Rejeté',                color: 'text-red-700',     bg: 'bg-red-50 border-red-200',       Icon: XCircle },
};

const REASONS: Record<string, string> = {
  not_received:  'Commande non reçue',
  damaged:       'Produit endommagé',
  wrong_product: 'Mauvais produit reçu',
  other:         'Autre problème',
};

export default function SellerDisputeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [responding, setResponding] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [showAllEvidence, setShowAllEvidence] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/disputes/${id}`),
      api.get('/auth/profile'),
    ]).then(([dRes, uRes]) => {
      setDispute(dRes.data.data);
      setCurrentUser(uRes.data?.user ?? uRes.data?.data ?? uRes.data);
    }).catch(() => {
      toast.error('Litige introuvable');
      router.push('/seller/disputes');
    }).finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleRespond = async () => {
    if (!responseText.trim()) { toast.error('Saisissez votre réponse'); return; }
    setResponding(true);
    try {
      const fd = new FormData();
      fd.append('response', responseText);
      attachments.forEach(f => fd.append('attachments[]', f));
      await api.post(`/disputes/${dispute.id}/respond`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Réponse envoyée — la discussion est ouverte');
      const res = await api.get(`/disputes/${id}`);
      setDispute(res.data.data);
      setResponseText('');
      setAttachments([]);
      setPreviews([]);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setResponding(false); }
  };

  const handleEscalate = async () => {
    if (!confirm('Transmettre ce litige à l\'administrateur ?')) return;
    setEscalating(true);
    try {
      await api.post(`/disputes/${dispute.id}/escalate`);
      toast.success('Litige transmis à l\'administrateur');
      setDispute((d: any) => ({ ...d, status: 'escalated', mode: 'admin' }));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setEscalating(false); }
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
  const { Icon } = cfg;
  const isResolved = ['resolved_amicably', 'resolved_by_admin', 'refunded', 'replaced', 'dismissed'].includes(dispute.status);
  const needsResponse = dispute.status === 'pending' && !dispute.seller_response;
  const canEscalate = dispute.mode === 'amiable' && dispute.status === 'negotiation';
  const evidenceList: string[] = dispute.attachments || [];

  // Étape de la timeline
  const step = isResolved ? 2 : (dispute.seller_response ? 1 : 0);

  return (
      <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-28 lg:pb-8">

        {/* Header */}
        <header className="sticky top-16 z-30 rounded-t-2xl border-b border-emerald-100/50 bg-white/85 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <Link href="/seller/disputes" className="flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-900 transition-colors group flex-shrink-0">
                <ChevronLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline">Retour</span>
              </Link>
              <h1 className="text-base md:text-xl font-bold text-slate-800 tracking-tight truncate">
                Litige #{dispute.id} — Commande #{dispute.order?.order_number}
              </h1>
            </div>

            {/* Actions desktop */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <button className="px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition-all">
                💳 Rembourser
              </button>
              <button className="px-6 py-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl transition-all">
                🔄 Remplacer
              </button>
              <button className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-all">
                ⚖️ Contester
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Colonne gauche — Infos */}
            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-28 order-1">

              {/* Timeline statut */}
              <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 md:p-6 shadow-sm shadow-emerald-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">État du litige</h3>
                <div className="flex items-center justify-between relative px-2">
                  <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 z-0" />

                  <div className="z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Ouvert</span>
                  </div>

                  <div className="z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 -mt-1 rounded-full border-4 border-white flex items-center justify-center shadow-xl ${step >= 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-300'} ${step === 1 ? 'ring-4 ring-emerald-200 animate-pulse' : ''}`}>
                      <MessageCircle size={18} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${step >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>Discussion</span>
                  </div>

                  <div className="z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                      <Package size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Résolution</span>
                  </div>
                </div>
              </section>

              {/* Détails litige */}
              <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 md:p-6 shadow-sm shadow-emerald-100 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-bold">ID #{dispute.id}</span>
                      <span className="text-[11px] text-slate-400">{new Date(dispute.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 truncate">{dispute.user?.firstname} {dispute.user?.lastname}</h2>
                    <p className="text-emerald-600 font-medium flex items-center gap-1.5 text-sm mt-0.5">
                      <Package size={14} />
                      Commande #{dispute.order?.order_number}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                    <Icon size={13} /> {cfg.label}
                  </span>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-1.5">Motif : {REASONS[dispute.reason] ?? dispute.reason}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{dispute.description}</p>
                </div>

                {/* Preuves */}
                {evidenceList.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Preuves fournies ({evidenceList.length})</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {evidenceList.slice(0, showAllEvidence ? evidenceList.length : 2).map((url: string, i: number) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden relative shadow-sm cursor-pointer group" onClick={() => window.open(storageUrl(url), '_blank')}>
                          <img src={storageUrl(url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      ))}
                      {!showAllEvidence && (
                        <button
                          onClick={() => setShowAllEvidence(true)}
                          className={`${evidenceList.length <= 2 ? 'hidden' : 'col-span-2'} h-16 rounded-xl border-2 border-dashed border-emerald-200 flex items-center justify-center bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors`}
                        >
                          <span className="text-emerald-600 text-sm font-semibold flex items-center gap-2">
                            <Eye size={16} /> Voir toutes les pièces ({evidenceList.length})
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </aside>

            {/* Colonne droite — Contenu principal */}
            <div className="lg:col-span-8 space-y-5 order-2">

              {needsResponse && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-700 flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <span>Ce client attend votre réponse. Expliquez votre version des faits ci-dessous.</span>
                </div>
              )}

              {/* Formulaire réponse initiale */}
              {needsResponse && (
                <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 md:p-6 shadow-sm shadow-emerald-100 space-y-4">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Votre réponse initiale</h2>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder="Expliquez votre version des faits. Soyez précis et honnête..."
                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 text-sm text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Joindre des preuves (photos, documents)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                      <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileChange} className="hidden" id="seller-files" />
                      <label htmlFor="seller-files" className="cursor-pointer flex flex-col items-center gap-1.5">
                        <Upload size={20} className="text-emerald-500" />
                        <span className="text-xs text-slate-400 font-medium">Cliquez pour ajouter</span>
                      </label>
                    </div>
                    {previews.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {previews.map((src, i) => (
                          <div key={i} className="relative aspect-square">
                            <img src={src} className="w-full h-full object-cover rounded-lg" />
                            <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleRespond}
                    disabled={responding}
                    className="w-full py-3.5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all"
                  >
                    {responding ? 'Envoi en cours...' : 'Envoyer ma réponse et ouvrir la discussion'}
                  </button>
                </section>
              )}

              {/* Réponse déjà envoyée */}
              {dispute.seller_response && (
                <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-5 md:p-6 shadow-sm shadow-emerald-100 space-y-2.5">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Votre réponse envoyée</h2>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed">{dispute.seller_response}</p>
                </section>
              )}

              {/* Chat */}
              {dispute.seller_response && !isResolved && currentUser && (
                <section className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm shadow-emerald-100 overflow-hidden flex flex-col h-[calc(100vh-300px)] min-h-[450px]">
                  <div className="bg-white/50 border-b border-emerald-100/50 px-5 md:px-6 py-4 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                      <h3 className="font-bold text-slate-800 text-sm truncate">Conversation en direct</h3>
                    </div>
                    <span className="text-xs text-slate-400 italic hidden sm:inline whitespace-nowrap">{dispute.user?.firstname} {dispute.user?.lastname}</span>
                  </div>
                  <DisputeChat disputeId={dispute.id} currentUserId={currentUser.id} />
                </section>
              )}

              {/* Question admin */}
              {dispute.admin_question && (
                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 flex items-start gap-3">
                  <ShieldQuestion size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-blue-800 mb-1.5">Question de l'administrateur</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">{dispute.admin_question}</p>
                    <p className="text-xs text-blue-500 mt-2">Répondez via le chat ci-dessus.</p>
                  </div>
                </div>
              )}

              {/* Escalade */}
              {canEscalate && (
                <section className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm shadow-emerald-100 p-5">
                  <button
                    onClick={handleEscalate}
                    disabled={escalating}
                    className="w-full py-3 bg-orange-50 text-orange-700 border border-orange-200 text-sm font-bold rounded-xl hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Flag size={16} />
                    {escalating ? 'Traitement...' : "Transmettre à l'administrateur"}
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-2">Si aucun accord n'est trouvé, l'admin tranchera.</p>
                </section>
              )}

              {/* Décision finale */}
              {dispute.admin_notes && (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                  <h3 className="text-sm font-bold text-emerald-800 mb-1.5">Décision de l'administration</h3>
                  <p className="text-sm text-emerald-700 leading-relaxed">{dispute.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer actions mobile */}
        <footer className="px-4 pb-24 lg:hidden">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl">
            <button className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 active:scale-95 transition-all">
              <span className="text-lg">💳</span>
              <span className="text-[10px] font-bold text-center leading-tight">Rembourser</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200 active:scale-95 transition-all">
              <span className="text-lg">🔄</span>
              <span className="text-[10px] font-bold text-center leading-tight">Remplacer</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 active:scale-95 transition-all">
              <span className="text-lg">⚖️</span>
              <span className="text-[10px] font-bold text-center leading-tight">Contester</span>
            </button>
          </div>
        </footer>
      </div>
  );
}
