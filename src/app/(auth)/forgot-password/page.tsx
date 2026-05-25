'use client';

import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── IMAGE DE FOND ── */}
      <img
        src="/images/istockphoto-1465642013-1024x1024.jpg"
        alt="Agriculture"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay vert semi-transparent */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(4,120,87,0.55) 0%, rgba(6,78,59,0.45) 100%)' }}
      />

      {/* ── BOUTON RETOUR (haut gauche) ── */}
      <a
        href="/login"
        className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full transition-all"
        style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </a>

      {/* ── CARTE ── */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-5 rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 24px 64px rgba(0,60,40,0.22), 0 4px 16px rgba(0,60,40,0.10)',
        }}
      >
        {!sent ? (
          <>
            {/* Icône */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  boxShadow: '0 4px 16px rgba(5,150,105,0.18)',
                }}
              >
                <svg className="w-8 h-8" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>

            {/* Titre */}
            <div className="text-center mb-7">
              <h2 className="text-[22px] font-bold" style={{ color: '#042f20' }}>
                Mot de passe oublié ?
              </h2>
              <p className="text-[14px] mt-2 leading-relaxed" style={{ color: '#5a8a72' }}>
                Entrez votre adresse e-mail pour recevoir les instructions de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Champ email */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold uppercase tracking-wider" style={{ color: '#3d7a5e' }}>
                  Adresse email
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                    style={{ color: '#7ab89a' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agriculteur@agritech.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-[14px] transition-all outline-none"
                    style={{
                      background: '#f0fdf8',
                      border: '1.5px solid #c6ead8',
                      color: '#042f20',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#059669';
                      e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#c6ead8';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 rounded-xl text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: email
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    : '#a7c5b8',
                  boxShadow: email ? '0 4px 20px rgba(5,150,105,0.30)' : 'none',
                  cursor: !email ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    Réinitialiser le mot de passe
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Retour */}
              <a
                href="/login"
                className="flex items-center justify-center gap-1.5 text-[13px] font-medium transition-colors"
                style={{ color: '#8ab89e' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </a>
            </form>
          </>
        ) : (
          /* ── ÉTAT : EMAIL ENVOYÉ ── */
          <div className="text-center py-4">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', boxShadow: '0 4px 16px rgba(5,150,105,0.2)' }}
              >
                <svg className="w-8 h-8" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-[22px] font-bold mb-2" style={{ color: '#042f20' }}>Email envoyé !</h2>
            <p className="text-[14px] leading-relaxed mb-2" style={{ color: '#5a8a72' }}>
              Un lien de réinitialisation a été envoyé à
            </p>
            <p className="text-[14px] font-semibold mb-8" style={{ color: '#059669' }}>{email}</p>
            <p className="text-[13px] mb-6" style={{ color: '#8ab89e' }}>
              Vérifiez votre boîte mail et vos spams.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-[14px] font-semibold"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 16px rgba(5,150,105,0.25)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </a>
          </div>
        )}
      </div>
    </div>
  );
}