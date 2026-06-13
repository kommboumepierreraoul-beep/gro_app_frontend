'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { 
  CheckCircle, Celebration, Rocket, AddCircle, Badge, Insights,
  ArrowForward, Inventory2, Verified, Store, Sparkles
} from 'lucide-react';

export default function ShopSuccessPage() {
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les informations de la boutique fraîchement créée
    const fetchShop = async () => {
      try {
        const res = await api.get('/my-shop/profile');
        setShop(res.data);
      } catch (error) {
        console.error('Erreur chargement boutique', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  const handleGoToDashboard = () => {
    router.push('/my-shop');
  };

  const handleAddProduct = () => {
    router.push('/my-shop/products/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-on-surface-variant">Chargement de votre boutique...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-x-hidden">
      {/* Navigation minimale */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="flex items-center justify-between px-6 md:px-12 h-16 w-full max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-primary">Intelligent Growth</div>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container overflow-hidden border-2 border-white shadow-sm">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOUVwe6v4A-GekYdrdiQDym6HXa-CL3KMh3E_WYoCK16q-dIQ5hf6d50kT1pDsg1XJ0JmS92xWEMGxxskEKhWM0pnBOra9k7kC9eHrbkaDb_s6A6J0T3TWIKeoAnMK3hwflxL-bIxFrpQrI81IV7Pzqg33yOdZC14zeiYpdgjdFv0ClQ6fXjqWP7wy0sPibnOQRBvnv8tSDNSZ2omtplCDQqsSr-smoPfcUXXGTPr2R_iPaZQO4JFfH3BcgPY9h-GPD2yu9hGJmvVC" 
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Icône de succès */}
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
              <CheckCircle size={56} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white animate-bounce">
              <Celebration size={24} />
            </div>
            <div className="absolute inset-0 scale-150 opacity-20 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl"></div>
          </div>

          {/* Texte de félicitations */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
              Félicitations ! <br/>
              <span className="text-primary">Votre boutique est prête.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Votre exploitation agricole est désormais en ligne sur AgriConnect. Vous pouvez dès maintenant commencer à vendre vos produits à travers le monde.
            </p>
          </div>

          {/* Carte récapitulative de la boutique */}
          <div className="glass-panel p-6 sm:p-8 rounded-xl max-w-md mx-auto flex items-center justify-between transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center border border-outline-variant">
                {shop?.logo_url ? (
                  <img src={shop.logo_url} alt="Logo boutique" className="w-full h-full object-cover" />
                ) : (
                  <Store size={32} className="text-primary" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-on-surface text-lg">{shop?.name || 'Votre boutique'}</h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Statut : Actif
                </p>
              </div>
            </div>
            <Verified size={24} className="text-primary" />
          </div>

          {/* Prochaines étapes */}
          <div className="pt-8 space-y-6">
            <h2 className="text-xl font-semibold text-on-surface flex items-center justify-center gap-2">
              <Rocket size={20} />
              Prochaines étapes suggérées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-xl text-left flex flex-col gap-4 hover:border-primary/40 transition-colors group cursor-pointer" onClick={handleAddProduct}>
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <AddCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Ajouter un produit</h4>
                  <p className="text-sm text-on-surface-variant mt-1">Créez votre première fiche produit avec des photos HD.</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl text-left flex flex-col gap-4 hover:border-primary/40 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Badge size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Compléter le profil</h4>
                  <p className="text-sm text-on-surface-variant mt-1">Détaillez votre histoire pour rassurer vos clients.</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl text-left flex flex-col gap-4 hover:border-primary/40 transition-colors group" onClick={handleGoToDashboard}>
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Insights size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Tableau de bord</h4>
                  <p className="text-sm text-on-surface-variant mt-1">Explorez vos futurs indicateurs de vente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoToDashboard}
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all group w-full sm:w-auto"
            >
              Accéder au tableau de bord
              <ArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleAddProduct}
              className="bg-surface-container-highest text-on-surface font-bold py-4 px-10 rounded-full flex items-center gap-2 hover:bg-surface-container-high active:scale-95 transition-all border border-outline-variant w-full sm:w-auto"
            >
              <Inventory2 size={18} />
              Ajouter un produit
            </button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-30"></div>

      <style jsx>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(6, 44, 34, 0.08);
        }
      `}</style>
    </div>
  );
}
