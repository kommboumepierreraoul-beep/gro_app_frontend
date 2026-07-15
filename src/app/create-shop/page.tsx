/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/create-shop/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, CheckCircle2, Globe2, Info, Package } from 'lucide-react';
import api from '@/lib/axios';
import { CreateShopIntro, CreateShopSkeleton } from '@/components/marketplace/CreateShopDesign';

export default function CreateShopHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const checkShop = async () => {
      try {
        const response = await api.get('/my-shop/profile');
        const shop = response.data?.data ?? response.data;
        if (shop?.status === 'rejected') {
          setLoading(false);
          setTimeout(() => setAnimate(true), 100);
          return;
        }
        router.push(shop?.status === 'active' ? '/my-shop' : '/shop-created');
      } catch (error: any) {
        if (error.response?.status === 404) {
          setLoading(false);
          // Déclencher l'animation après le chargement
          setTimeout(() => setAnimate(true), 100);
        } else {
          setLoading(false);
          setTimeout(() => setAnimate(true), 100);
        }
      }
    };
    const timer = window.setTimeout(() => {
      checkShop();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const handleStart = () => {
    router.push('/create-shop/configuration');
  };

  if (loading) {
    return <CreateShopSkeleton />;
  }

  if (!loading) {
    return <CreateShopIntro onBack={() => router.back()} onStart={handleStart} />;
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-2xl bg-[#e6fff4] flex flex-col items-center">
      <header className="sticky top-16 w-full z-30 rounded-t-2xl bg-[#e6fff4]/85 backdrop-blur-xl border-b border-[#bbcabf]/30 shadow-sm h-20">
        <div className="flex items-center justify-between px-4 md:px-12 h-full max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#10b981]/20 transition-colors active:scale-95 duration-200 text-[#3c4a42]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-headline text-2xl font-bold text-[#006c49] tracking-tighter">
            AgriGrow Marketplace
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-4xl px-4 py-12 md:px-8">
        {/* Hero Image avec animation */}
        <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative w-full h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden shadow-lg mb-10 group">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGtpCykGtg81PAqS3gwXYrLLCXsIFJb0ttYgUN83CT8-azfzGArSRddFFxChrKIL6pz0jbGv6fbdZTzuk8QSqNAeM2wrXAuJ163K7GaBkPnyxA5SteuXcQ93dSGGmUdgJyLAPpA5CcfGD2Fm4gY26IrcnqRaTFpq8JrBAUfluPV9W5BqX9Qnbftg12_aD9wSpYzgslUGaDBoh08l3T4JYDAhoUNturF-ntTNzwA8aBV8MyV-U8pcEFxrusWLpRex7-ddn0mS8W-Ok6"
              alt="Farmer with tablet"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00422b]/60 to-transparent flex items-end p-8 rounded-[3rem]">
              <h2 className="text-white font-headline text-3xl md:text-5xl font-extrabold tracking-tight">
                Lancez votre boutique Agripulse
              </h2>
            </div>
          </div>
        </div>

        {/* Grille des cartes avec animations décalées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <section className="glass-card p-8 rounded-[3rem] bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm">
              <h3 className="text-[#3c4a42] font-label text-sm font-semibold uppercase tracking-widest mb-6">
                Pourquoi créer votre boutique ?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#aeeecb] flex items-center justify-center shrink-0">
                    <Globe2 className="h-5 w-5 text-[#316e52]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#002118]">Vendez partout</h4>
                    <p className="text-[#3c4a42] text-sm">
                      Accédez à des milliers d'acheteurs professionnels et particuliers sans frontières.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#aeeecb] flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-[#316e52]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#002118]">Gérez vos stocks</h4>
                    <p className="text-[#3c4a42] text-sm">
                      Outils intelligents pour suivre vos récoltes et disponibilités en temps réel.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#aeeecb] flex items-center justify-center shrink-0">
                    <BadgeCheck className="h-5 w-5 text-[#316e52]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#002118]">Paiements sécurisés</h4>
                    <p className="text-[#3c4a42] text-sm">
                      Transactions protégées et virements automatiques après chaque vente validée.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={`transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <section className="flex flex-col gap-6">
              <div className="glass-card p-8 rounded-[3rem] bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm flex-1">
                <h3 className="text-[#3c4a42] font-label text-sm font-semibold uppercase tracking-widest mb-6">
                  Ce dont vous aurez besoin
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-[#002118] font-medium">
                    <CheckCircle2 className="h-5 w-5 text-[#006c49]" />
                    Nom de la boutique
                  </li>
                  <li className="flex items-center gap-3 text-[#002118] font-medium">
                    <CheckCircle2 className="h-5 w-5 text-[#006c49]" />
                    Photos professionnelles
                  </li>
                  <li className="flex items-center gap-3 text-[#002118] font-medium">
                    <CheckCircle2 className="h-5 w-5 text-[#006c49]" />
                    Coordonnées complètes
                  </li>
                </ul>
              </div>
              <div className="bg-[#caf1e1] p-6 rounded-[2rem] border border-[#bbcabf]/30 flex items-start gap-3">
                <Info className="h-5 w-5 shrink-0 text-[#3c4a42]" />
                <p className="text-xs text-[#3c4a42] leading-relaxed">
                  En créant votre boutique, vous acceptez nos conditions d'utilisation et notre politique de commission de 5% par vente. Cette commission nous permet de maintenir la plateforme et de sécuriser vos transactions.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Bouton CTA avec animation */}
        <div className={`transition-all duration-700 delay-300 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mt-12 flex flex-col items-center gap-6">
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-[#006c49] to-[#2c694e] text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg shadow-[#006c49]/20 hover:scale-105 active:scale-95 transition-all duration-300 w-full md:w-auto"
            >
              Démarrer la configuration
            </button>
            <p className="text-[#3c4a42] text-xs font-medium">Temps estimé : 5 minutes</p>
          </div>
        </div>
      </main>

      <div className="fixed top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[#6ffbbe]/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[30vw] h-[30vw] bg-[#b1f0ce]/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
