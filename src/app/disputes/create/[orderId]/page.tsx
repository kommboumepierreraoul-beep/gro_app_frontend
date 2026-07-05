'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Camera, X, Info, Send, HelpCircle, ImageIcon } from 'lucide-react';
import Link from 'next/link';

const REASONS = [
  { value: 'not_received', label: 'Commande non reçue' },
  { value: 'damaged', label: 'Produit endommagé' },
  { value: 'wrong_product', label: 'Mauvais produit reçu' },
  { value: 'other', label: 'Autre problème' },
];

const PRIORITIES = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyen' },
  { value: 'urgent', label: 'Urgent', danger: true },
];

export default function CreateDisputePage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [form, setForm] = useState({ reason: '', description: '', attachments: [] as File[] });
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => { fetchOrder(); }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data.data);
    } catch {
      toast.error('Commande introuvable');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (form.attachments.length + files.length > 4) {
      toast.error('Maximum 4 photos');
      return;
    }
    setForm({ ...form, attachments: [...form.attachments, ...files] });
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setForm({ ...form, attachments: form.attachments.filter((_, i) => i !== index) });
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason) { toast.error('Veuillez choisir un motif'); return; }
    if (!form.description.trim()) { toast.error('Veuillez décrire votre problème'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('order_id', orderId as string);
      fd.append('reason', form.reason);
      fd.append('description', form.description);
      form.attachments.forEach(file => fd.append('attachments[]', file));
      await api.post('/disputes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Réclamation envoyée avec succès !');
      router.push('/disputes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
  );

  const statusLabel: Record<string, string> = {
    paid: 'Payé', shipping: 'En livraison', delivered: 'Livré',
    completed: 'Terminé', pending: 'En attente',
  };

  return (
      <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-8">
        {/* Header */}
        <header className="sticky top-16 z-30 rounded-t-2xl border-b border-emerald-100/50 bg-white/85 px-6 py-4 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/orders" className="flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-900 transition-colors group">
                <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline">Retour aux commandes</span>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Signaler un problème</h1>
            </div>
            <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors text-sm font-medium">
              <HelpCircle size={18} />
              <span className="hidden md:inline">Besoin d'aide ?</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Colonne gauche — Récapitulatif */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Récapitulatif de la commande</p>

              {/* Card commande */}
              <div className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-sm shadow-emerald-100 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-emerald-50 flex-shrink-0 overflow-hidden shadow-inner">
                    {(() => {
                      try {
                        const imgs = JSON.parse(order?.items?.[0]?.product?.images || '[]');
                        return imgs[0]
                          ? <img src={`http://localhost:8000${imgs[0]}`} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>;
                      } catch { return <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>; }
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">
                      {order?.items?.[0]?.product?.name || 'Commande'}
                      {order?.items?.length > 1 && <span className="text-emerald-600"> +{order.items.length - 1}</span>}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">#{order?.order_number}</p>
                    <p className="text-emerald-600 font-bold text-lg mt-1">
                      {Number(order?.total_amount).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Date de commande</span>
                    <span className="font-medium text-slate-700">
                      {order?.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-400">Statut</span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[11px] uppercase tracking-wide">
                      {statusLabel[order?.status] || order?.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info processus */}
              <div className="bg-emerald-50/80 border border-emerald-200/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <Info size={16} />
                  <span>Processus de résolution</span>
                </div>
                <p className="text-sm text-emerald-800/70 leading-relaxed">
                  Notre équipe analysera votre demande sous <span className="font-bold text-emerald-700">24h à 48h</span>. Une fois validée, nous procéderons au remplacement ou au remboursement.
                </p>
                <ul className="text-xs text-emerald-700/60 space-y-1.5 list-disc pl-4">
                  <li>Conservez l'emballage d'origine</li>
                  <li>Prenez des photos claires des dommages</li>
                  <li>Les réclamations sont traitées par ordre d'arrivée</li>
                </ul>
              </div>
            </aside>

            {/* Colonne droite — Formulaire */}
            <div className="lg:col-span-8">
              <form onSubmit={handleSubmit} className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl p-6 md:p-10 shadow-xl shadow-emerald-100/50 space-y-8">

                {/* Motif + Urgence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 ml-1">Motif de la réclamation</label>
                    <select
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all appearance-none"
                    >
                      <option value="" disabled>Sélectionnez un motif...</option>
                      {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 ml-1">Niveau d'urgence</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={`py-3.5 px-2 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${
                            priority === p.value
                              ? p.danger
                                ? 'border-red-400 bg-red-50 text-red-600'
                                : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Description détaillée</label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Décrivez précisément le problème rencontré. Plus vous serez précis, plus nous pourrons vous aider rapidement..."
                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    required
                  />
                </div>

                {/* Upload photos */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end ml-1">
                    <div>
                      <label className="block text-sm font-bold text-slate-700">Preuves visuelles (Photos)</label>
                      <p className="text-xs text-slate-400 mt-0.5 italic">Formats : JPG, PNG. Max 5Mo par fichier.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                      {previews.length} / 4
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Bouton upload */}
                    {previews.length < 4 && (
                      <label className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group">
                        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                        <div className="bg-white rounded-full p-3 shadow-sm group-hover:scale-110 transition-transform mb-2">
                          <Camera size={20} className="text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-wider">Ajouter</span>
                      </label>
                    )}

                    {/* Previews */}
                    {previews.map((src, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group">
                        <img src={src} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {/* Placeholders vides */}
                    {Array.from({ length: Math.max(0, 4 - previews.length - (previews.length < 4 ? 1 : 0)) }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center opacity-40">
                        <ImageIcon size={20} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:flex-1 py-4 px-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-base rounded-full shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 order-1 sm:order-2"
                  >
                    {submitting ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Send size={18} /> Envoyer la réclamation</>
                    )}
                  </button>
                  <Link
                    href="/orders"
                    className="w-full sm:w-auto py-4 px-10 text-emerald-700 font-bold text-sm hover:bg-emerald-50 rounded-full transition-colors text-center order-2 sm:order-1"
                  >
                    Annuler
                  </Link>
                </div>

                <p className="text-center text-xs text-slate-400">
                  En envoyant votre réclamation, vous acceptez nos{' '}
                  <a href="#" className="underline font-semibold hover:text-emerald-600 transition-colors">Conditions de Litige</a>
                  {' '}et notre politique de confidentialité.
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
  );
}
