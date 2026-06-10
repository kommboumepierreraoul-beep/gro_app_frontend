'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function ConfigureShopPage() {
  const router = useRouter();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoFileRef = useRef<File | null>(null);
  const bannerFileRef = useRef<File | null>(null);

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

      router.push('/my-shop');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la création de la boutique.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6fff4] font-sans relative overflow-x-hidden">
      {/* Éléments décoratifs */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
        <span className="material-symbols-outlined absolute -top-20 -left-20 text-[400px]">eco</span>
        <span className="material-symbols-outlined absolute top-1/2 -right-40 text-[500px]">potted_plant</span>
        <span className="material-symbols-outlined absolute -bottom-40 left-1/3 text-[300px]">psychology_alt</span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#bbcabf]/30 px-6 py-4 shadow-sm bg-[#e6fff4]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-[#cff6e6] rounded-full transition-all text-[#002118]">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#006c49] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#006c49]/20">
                <span className="material-symbols-outlined">agriculture</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#002118]">AgriConnect</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-[#3c4a42] hover:bg-[#cff6e6] rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-[#bbcabf]/30 mx-2"></div>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-[#cff6e6] transition-colors">
              <span className="text-sm font-semibold text-[#002118]">Aide</span>
              <div className="w-8 h-8 rounded-full bg-[#aeeecb] flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-[#316e52]">help</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <main className="py-10 md:py-16 px-4 max-w-2xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006c49]/10 text-[#006c49] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">storefront</span> Étape finale
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#002118] tracking-tight mb-4">
            Configurez votre vitrine
          </h1>
          <p className="text-[#3c4a42] text-lg max-w-lg mx-auto leading-relaxed font-medium">
            Établissez la présence numérique de votre exploitation. Ces détails permettront aux acheteurs locaux de vous identifier.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section Identité visuelle */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
                <span className="material-symbols-outlined text-2xl">palette</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#002118]">Identité visuelle</h2>
                <p className="text-sm text-[#3c4a42]">Définissez l'apparence de votre marque</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-10 space-y-8 shadow-lg border border-[#bbcabf]/20">
              {/* Logo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#002118]">Logo de la boutique</label>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#c4ebdb] rounded-full text-[#3c4a42] font-bold">Requis</span>
                </div>
                <div className="relative group cursor-pointer aspect-square w-32 mx-auto rounded-full bg-[#d5fcec] border-2 border-dashed border-[#bbcabf]/50 flex flex-col items-center justify-center transition-all hover:border-[#006c49]/40 hover:bg-[#006c49]/5">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-[#6c7a71] group-hover:text-[#006c49] transition-all">add_a_photo</span>
                      <span className="text-[10px] mt-2 font-bold text-[#6c7a71] tracking-wider">MODIFIER</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-center text-xs text-[#3c4a42] font-medium">Format carré recommandé (ex: 500x500px)</p>
              </div>
              {/* Bannière */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#002118]">Bannière de couverture</label>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#c4ebdb] rounded-full text-[#3c4a42] font-bold">Requis</span>
                </div>
                <div className="relative group cursor-pointer aspect-[21/9] w-full rounded-xl bg-[#d5fcec] border-2 border-dashed border-[#bbcabf]/50 flex flex-col items-center justify-center transition-all hover:border-[#006c49]/40 hover:bg-[#006c49]/5">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-[#6c7a71] group-hover:text-[#006c49]">wallpaper</span>
                      <span className="text-[10px] mt-2 font-bold text-[#6c7a71] tracking-wider uppercase">Ajouter une bannière</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </section>

          {/* Section Détails de l'entreprise */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
                <span className="material-symbols-outlined text-2xl">business</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#002118]">Détails de l'entreprise</h2>
                <p className="text-sm text-[#3c4a42]">Informations générales sur votre activité</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-10 space-y-8 shadow-lg border border-[#bbcabf]/20">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-bold text-[#3c4a42] ml-1">Nom de la boutique <span className="text-[#ba1a1a] font-bold">*</span></label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Les Vergers d'Occitanie"
                  className="w-full bg-white border border-[#bbcabf]/50 focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10 rounded-2xl py-4 px-5 text-[#002118] transition-all placeholder:text-[#6c7a71]/60 font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="slug" className="block text-sm font-bold text-[#3c4a42] ml-1">Adresse URL personnalisée <span className="text-[#ba1a1a] font-bold">*</span></label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#3c4a42] font-medium text-sm flex items-center pointer-events-none">
                    <span className="opacity-50">agriconnect.com/</span>
                  </div>
                  <input
                    type="text"
                    id="slug"
                    value={form.slug}
                    onChange={handleInputChange}
                    placeholder="nom-boutique"
                    className="w-full bg-white border border-[#bbcabf]/50 focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10 rounded-2xl py-4 px-5 pl-48 text-[#002118] transition-all placeholder:text-[#6c7a71]/60 font-medium"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#3c4a42] ml-1 font-medium">C'est le lien direct vers votre profil public.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-bold text-[#3c4a42] ml-1">Votre histoire &amp; valeurs <span className="text-[#ba1a1a] font-bold">*</span></label>
                <textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Présentez votre savoir-faire, vos méthodes de culture, ou l'origine de vos produits..."
                  className="w-full bg-white border border-[#bbcabf]/50 focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10 rounded-2xl py-4 px-5 text-[#002118] transition-all placeholder:text-[#6c7a71]/60 font-medium resize-y"
                  required
                />
              </div>
            </div>
          </section>

          {/* Section Coordonnées */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
                <span className="material-symbols-outlined text-2xl">location_on</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#002118]">Coordonnées</h2>
                <p className="text-sm text-[#3c4a42]">Où vous trouver et vous contacter</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-10 space-y-8 shadow-lg border border-[#bbcabf]/20">
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-bold text-[#3c4a42] ml-1">Adresse de l'exploitation <span className="text-[#ba1a1a] font-bold">*</span></label>
                <input
                  type="text"
                  id="address"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="123 Route des Plaines"
                  className="w-full bg-white border border-[#bbcabf]/50 focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10 rounded-2xl py-4 px-5 text-[#002118] transition-all placeholder:text-[#6c7a71]/60 font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-bold text-[#3c4a42] ml-1">Ville <span className="text-[#ba1a1a] font-bold">*</span></label>
                  <input
                    type="text"
                    id="city"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="Douala"
                    className="w-full bg-white border border-[#bbcabf]/50 focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10 rounded-2xl py-4 px-5 text-[#002118] transition-all placeholder:text-[#6c7a71]/60 font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-bold text-[#3c4a42] ml-1">Téléphone direct <span className="text-[#ba1a1a] font-bold">*</span></label>
                  <div className="flex">
                    <div className="flex items-center gap-2 bg-[#caf1e1] px-4 rounded-l-xl border-y border-l border-[#bbcabf]/30 text-xs font-bold text-[#3c4a42]">
                      <span className="w-4 h-3 bg-blue-100 rounded-sm overflow-hidden">
                        <span className="block h-full w-1/3 bg-blue-700"></span>
                      </span>
                      +237
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="6 12 34 56 78"
                      className="w-full bg-white border border-[#bbcabf]/50 focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10 rounded-2xl py-4 px-5 text-[#002118] transition-all placeholder:text-[#6c7a71]/60 font-medium rounded-l-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="pt-6 space-y-6">
            <div className="flex items-start gap-4 p-5 bg-[#006c49]/5 rounded-2xl border border-[#006c49]/10">
              <span className="material-symbols-outlined text-[#006c49] mt-0.5">verified_user</span>
              <div>
                <h4 className="text-sm font-bold text-[#002118]">Vérification de sécurité</h4>
                <p className="text-xs text-[#3c4a42] mt-1 leading-relaxed">
                  Pour garantir l'authenticité de notre réseau, votre boutique sera validée par notre équipe sous 24h ouvrées.
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-[#006c49] to-[#2c694e] text-white font-bold text-xl shadow-xl shadow-[#006c49]/30 hover:shadow-[#006c49]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création en cours...
                </>
              ) : (
                <>
                  Créer ma boutique
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-[#6c7a71] font-medium max-w-xs mx-auto">
              En créant votre boutique, vous acceptez nos <a href="#" className="text-[#006c49] font-bold hover:underline">Conditions d'Utilisation Vendeur</a>.
            </p>
          </div>
        </form>

        <footer className="mt-16 pb-12 pt-8 border-t border-[#bbcabf]/10 text-center">
          <p className="text-[#3c4a42] text-sm font-medium">© 2024 AgriConnect Marketplace. Propulsé par AgriGrow.</p>
        </footer>
      </main>

      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}