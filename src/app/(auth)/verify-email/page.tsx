/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth(); // récupère l'utilisateur connecté
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(59);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-submit quand les 6 chiffres sont remplis
  const filled = otp.filter(Boolean).length;
  useEffect(() => {
    if (filled === 6 && !loading && !error) {
      handleSubmit(new Event('submit') as any);
    }
  }, [filled]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleChange = (index: number, value: string) => {
    setError(null); // efface l'erreur dès que l'utilisateur modifie un chiffre
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const next = Math.min(index + digits.length, 5);
      inputRefs.current[next]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp]; newOtp[index] = ''; setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyEmail(code);
      if (response.success) {
        router.push('/');
      } else {
        setError(response.message || 'Code invalide ou expiré. Veuillez réessayer.');
        // On ne vide pas l'OTP pour permettre à l'utilisateur de corriger
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez votre code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerificationCode();
      setError(null);
      setOtp(Array(6).fill(''));
      setTimer(59);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Impossible de renvoyer le code. Réessayez plus tard.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #e8faf2 0%, #f0fdf8 50%, #e2f8ee 100%)' }}
    >
      {/* HEADER */}
      <header className="px-8 pt-8 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#059669' }}>
            <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[17px]" style={{ color: '#064e35' }}>AgriTech</span>
        </div>
      </header>

      {/* CENTRE : CARTE OTP */}
      <div className="flex-grow flex items-center justify-center px-5 py-12">
        <div
          className="w-full max-w-[440px] rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 20px 60px rgba(0,80,50,0.10), 0 4px 16px rgba(0,80,50,0.06)',
          }}
        >
          {/* Icône email */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                boxShadow: '0 4px 16px rgba(5,150,105,0.15)',
              }}
            >
              <svg className="w-8 h-8" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Titre modifié */}
          <div className="text-center mb-7">
            <h2 className="text-[24px] font-bold" style={{ color: '#042f20' }}>Vérification de l'email</h2>
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: '#5a8a72' }}>
              Nous avons envoyé un code à 6 chiffres à votre adresse e-mail
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cases OTP */}
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  className="text-center text-[22px] font-bold rounded-xl transition-all outline-none"
                  style={{
                    width: 52,
                    height: 56,
                    border: digit ? '2px solid #059669' : '1.5px solid #c6ead8',
                    background: digit ? '#f0fdf8' : '#f8fffe',
                    color: '#042f20',
                    boxShadow: digit ? '0 0 0 3px rgba(5,150,105,0.10)' : 'none',
                    caretColor: '#059669',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = digit ? '#059669' : '#c6ead8';
                    e.target.style.boxShadow = digit ? '0 0 0 3px rgba(5,150,105,0.10)' : 'none';
                  }}
                />
              ))}
            </div>

            {/* Barre de progression */}
            <div className="space-y-1.5">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: '#e2f0eb' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(filled / 6) * 100}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }}
                />
              </div>
              <p className="text-[12px] text-right" style={{ color: '#8ab89e' }}>{filled}/6 chiffres</p>
            </div>

            {/* Email dynamique + timer */}
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: '#f0fdf8', border: '1px solid #d4edd9' }}>
              <p className="text-[13px]" style={{ color: '#4a8069' }}>
                Code envoyé à{' '}
                <span className="font-semibold" style={{ color: '#059669' }}>{user?.email || 'exemple@email.com'}</span>
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || timer > 0}
                  className="flex items-center gap-1.5 text-[13px] font-semibold transition-all disabled:opacity-40"
                  style={{ color: '#059669' }}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  Renvoyer
                </button>
                <span className="w-1 h-1 rounded-full" style={{ background: '#c6ead8' }} />
                <span className="text-[13px] font-mono font-bold" style={{ color: timer === 0 ? '#ef4444' : '#059669' }}>
                  {formatTimer(timer)}
                </span>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div
                className="text-center text-sm py-2 rounded-lg"
                style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}
              >
                {error}
              </div>
            )}

            {/* Bouton (toujours présent, mais auto-submit déjà actif) */}
            <button
              type="submit"
              disabled={loading || filled < 6}
              className="w-full py-4 rounded-xl text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: filled === 6 ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#a7c5b8',
                boxShadow: filled === 6 ? '0 4px 20px rgba(5,150,105,0.30)' : 'none',
                cursor: filled < 6 ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Vérification…
                </>
              ) : (
                <>Vérifier le code <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Lien retour plus foncé et avec soulignement au survol */}
            <a
              href="/login"
              className="block text-center text-[13px] font-medium transition-all hover:underline"
              style={{ color: '#4a8069' }}
            >
              ← Retour à la connexion
            </a>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-5 text-center" style={{ borderTop: '1px solid rgba(0,120,70,0.08)' }}>
        <p className="text-[12px]" style={{ color: '#8ab89e' }}>
          © 2024 AgriTech Smart Systems — Precision for a sustainable future.
        </p>
      </footer>
    </div>
  );
}