'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShopCreatedPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState('Votre boutique');
  const [shopLogo, setShopLogo] = useState('');

  useEffect(() => {
    const name = sessionStorage.getItem('newShopName');
    const logo = sessionStorage.getItem('newShopLogo');
    if (name) setShopName(name);
    if (logo) setShopLogo(logo);
    // Nettoyer après utilisation
    sessionStorage.removeItem('newShopName');
    sessionStorage.removeItem('newShopLogo');

    // Animations
    const elements = document.querySelectorAll('.animate-on-load');
    elements.forEach((el, idx) => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'translateY(0)';
      }, idx * 100);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#e6fff4] text-gray-800 overflow-x-hidden">
      {/* ... header ... */}
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl text-center space-y-8">
          {/* Icône succès */}
          <div className="relative inline-block animate-on-load" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease-out' }}>
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="material-symbols-outlined text-emerald-700 text-5xl sm:text-6xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-center text-white animate-bounce">
              <span className="material-symbols-outlined text-xl">celebration</span>
            </div>
            <div className="absolute inset-0 scale-150 opacity-20 bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-full blur-3xl"></div>
          </div>

          {/* Titres */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight leading-tight">
              Félicitations ! <br /> <span className="text-emerald-700">Votre boutique est prête.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-on-load" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}>
              Votre exploitation agricole est désormais en ligne sur AgriConnect. Vous pouvez dès maintenant commencer à vendre vos produits à travers le monde.
            </p>
          </div>

          {/* Carte résumé */}
          <div className="glass-panel p-6 sm:p-8 rounded-xl max-w-md mx-auto flex items-center justify-between transition-all hover:scale-[1.02] animate-on-load" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease-out 0.2s' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                {shopLogo ? (
                  <img src={shopLogo} alt="Logo boutique" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-gray-400 text-3xl">store</span>
                )}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-800 text-lg">{shopName}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Statut : Actif
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>

          {/* Étapes suggérées (inchangées) */}
          <div className="pt-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">rocket_launch</span>
              Prochaines étapes suggérées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'add_circle', title: 'Ajouter un produit', desc: 'Créez votre première fiche produit avec des photos HD.' },
                { icon: 'badge', title: 'Compléter le profil', desc: 'Détaillez votre histoire pour rassurer vos clients.' },
                { icon: 'insights', title: 'Tableau de bord', desc: 'Explorez vos futurs indicateurs de vente.' }
              ].map((step, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-xl text-left flex flex-col gap-4 hover:border-emerald-200 transition-all animate-on-load" style={{ opacity: 0, transform: 'translateY(20px)', transition: `all 0.6s ease-out ${0.3 + idx * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-emerald-700">
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{step.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-on-load" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease-out 0.6s' }}>
            <button onClick={() => router.push('/my-shop')} className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all group">
              Accéder au tableau de bord
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button onClick={() => router.push('/add-product')} className="bg-gray-200 text-gray-800 font-bold py-4 px-10 rounded-full flex items-center gap-2 hover:bg-gray-300 active:scale-95 transition-all border border-gray-300">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
              Ajouter un produit
            </button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-700 to-emerald-500 opacity-30"></div>

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(6, 44, 34, 0.08);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}