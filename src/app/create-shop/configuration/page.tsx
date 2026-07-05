// src/app/create-shop/configuration/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Store, Palette, Image, MapPin, Phone, Globe, 
  User, ShieldCheck, Loader2, Sparkles, Heart, Upload, X, AlertCircle, Building2, Navigation
} from 'lucide-react';

export default function ConfigureShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    city: '',
    phone: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const logoFileRef = useRef<File | null>(null);
  const bannerFileRef = useRef<File | null>(null);

  useEffect(() => {
    const checkShop = async () => {
      try {
        await api.get('/my-shop/profile');
        router.push('/my-shop'); // ← Redirection vers la page de succès
      } catch (error: any) {
        if (error.response?.status === 404) {
          setLoading(false);
          setTimeout(() => setAnimate(true), 100);
        } else {
          setLoading(false);
          setTimeout(() => setAnimate(true), 100);
        }
      }
    };
    checkShop();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      logoFileRef.current = file;
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      bannerFileRef.current = file;
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = () => {
    if (form.name) {
      const slug = form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('slug', form.slug);
      formData.append('description', form.description);
      formData.append('address', form.address);
      formData.append('city', form.city);
      formData.append('phone', form.phone);
      if (logoFileRef.current) formData.append('logo', logoFileRef.current);
      if (bannerFileRef.current) formData.append('banner', bannerFileRef.current);

      await api.post('/marketplace/shops', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Stocker les infos dans sessionStorage
sessionStorage.setItem('newShopName', form.name);
sessionStorage.setItem('newShopLogo', logoPreview || '');
sessionStorage.setItem('newShopBanner', bannerPreview || '');
router.push('/shop-created');

      toast.success('Boutique créée avec succès !');
       router.push('/shop-created'); // ← Redirection vers la page de succès
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la création de la boutique.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-[#006c49]">Vérification...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-8">
      {/* Navigation - aucune animation sur la nav */}
      <nav className="sticky top-16 z-30 rounded-t-2xl bg-white/85 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-emerald-100 transition-all duration-200 text-emerald-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Store size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                Agripulse
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full">
              <ShieldCheck size={16} />
              <span>Plateforme certifiée</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <User size={16} className="text-white" />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative py-12 md:py-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header avec animation */}
          <div className={`text-center mb-12 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6 shadow-sm">
              <Sparkles size={16} />
              <span>Lancez votre boutique en ligne</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent mb-4">
              Créez votre vitrine
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Rejoignez des milliers d'agriculteurs et vendez vos produits à travers le Cameroun
            </p>
          </div>

          {/* Message d'erreur (sans animation spécifique) */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Identité visuelle avec animation décalée */}
            <div className={`transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-emerald-100">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Palette size={22} className="text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Identité visuelle</h2>
                    <p className="text-sm text-slate-500">Donnez vie à votre marque</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Logo de la boutique</label>
                    <div className={`relative group cursor-pointer aspect-square max-w-[200px] mx-auto rounded-2xl bg-slate-50 border-2 border-dashed transition-all ${logoPreview ? 'border-emerald-300' : 'border-slate-200 hover:border-emerald-400'}`}>
                      {logoPreview ? (
                        <div className="relative w-full h-full">
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full rounded-2xl object-cover" />
                          <button type="button" onClick={() => { setLogoPreview(null); logoFileRef.current = null; }} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-slate-400 group-hover:text-emerald-600 transition">
                          <Upload size={32} className="mb-2" />
                          <span className="text-xs font-medium">Cliquez ou glissez</span>
                          <span className="text-[10px]">PNG, JPG jusqu'à 2MB</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Bannière de couverture</label>
                    <div className={`relative group cursor-pointer aspect-[21/9] rounded-xl bg-slate-50 border-2 border-dashed transition-all ${bannerPreview ? 'border-emerald-300' : 'border-slate-200 hover:border-emerald-400'}`}>
                      {bannerPreview ? (
                        <div className="relative w-full h-full">
                          <img src={bannerPreview} alt="Banner preview" className="w-full h-full rounded-xl object-cover" />
                          <button type="button" onClick={() => { setBannerPreview(null); bannerFileRef.current = null; }} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-slate-400 group-hover:text-emerald-600 transition">
                          <Image size={28} className="mb-2" />
                          <span className="text-xs font-medium">Ajouter une bannière</span>
                          <span className="text-[10px]">Recommandé 1200x400px</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Informations générales avec animation décalée */}
            <div className={`transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-emerald-100">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Building2 size={22} className="text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Informations générales</h2>
                    <p className="text-sm text-slate-500">Détails de votre activité agricole</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Nom de la boutique <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" id="name" value={form.name} onChange={handleInputChange} onBlur={() => setFocusedField(null)} onFocus={() => setFocusedField('name')} placeholder="Ex: Les Vergers d'Occitanie"
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${focusedField === 'name' ? 'border-emerald-400 ring-4 ring-emerald-100' : 'border-slate-200'} bg-white/80 focus:outline-none text-slate-800`} required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 mb-2">Adresse URL <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" id="slug" value={form.slug} onChange={handleInputChange} onBlur={() => setFocusedField(null)} onFocus={() => setFocusedField('slug')} placeholder="nom-boutique"
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${focusedField === 'slug' ? 'border-emerald-400 ring-4 ring-emerald-100' : 'border-slate-200'} bg-white/80 focus:outline-none text-slate-800 font-mono text-sm`} required />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-slate-400">agripulse.com/{form.slug || 'votre-boutique'}</p>
                      {form.name && !form.slug && (<button type="button" onClick={generateSlug} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Générer automatiquement</button>)}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
                    <textarea id="description" rows={5} value={form.description} onChange={handleInputChange} placeholder="Présentez votre exploitation, vos méthodes de culture, vos valeurs..." className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/80 resize-y text-slate-800" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Coordonnées avec animation décalée */}
            <div className={`transition-all duration-700 delay-300 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-emerald-100">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <MapPin size={22} className="text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Coordonnées</h2>
                    <p className="text-sm text-slate-500">Où et comment vous joindre</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">Adresse <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Navigation size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" id="address" value={form.address} onChange={handleInputChange} placeholder="123 Route des Plaines" className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white/80" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div><label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">Ville <span className="text-red-500">*</span></label><input type="text" id="city" value={form.city} onChange={handleInputChange} placeholder="Douala" className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white/80" required /></div>
                    <div><label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">Téléphone <span className="text-red-500">*</span></label><div className="relative"><Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="tel" id="phone" value={form.phone} onChange={handleInputChange} placeholder="6 12 34 56 78" className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white/80" required /></div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer sécurité avec animation */}
            <div className={`transition-all duration-700 delay-400 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex flex-wrap gap-6 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm"><ShieldCheck size={20} className="text-emerald-600" /></div>
                    <div><p className="text-sm font-semibold text-slate-700">Validation en 24h</p><p className="text-xs text-slate-500">Votre boutique sera vérifiée par notre équipe</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm"><Heart size={20} className="text-emerald-600" /></div>
                    <div><p className="text-sm font-semibold text-slate-700">Communauté solidaire</p><p className="text-xs text-slate-500">Rejoignez des milliers d'agriculteurs</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de soumission avec animation */}
            <div className={`transition-all duration-700 delay-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? (<><Loader2 size={22} className="animate-spin" /> Création en cours...</>) : (<><Sparkles size={20} /> Lancer ma boutique <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" /></>)}
              </button>
              <p className="text-center text-xs text-slate-400 mt-6">En créant votre boutique, vous acceptez nos <a href="#" className="text-emerald-600 hover:underline font-medium">Conditions d'utilisation</a></p>
            </div>

          </form>

          <footer className={`mt-16 pt-8 border-t border-emerald-100/50 text-center transition-all duration-700 delay-600 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-slate-400 text-sm">© 2024 Agripulse. Tous droits réservés.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
