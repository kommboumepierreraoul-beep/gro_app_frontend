'use client';

import { useState } from 'react';
import { Eye, EyeOff, Leaf, Check, ArrowRight, AlertCircle, XCircle } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validateEmail = (val: string) => {
    if (!val.trim()) return "L'adresse email est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Format d'email invalide.";
    return undefined;
  };

  const validatePassword = (val: string) => {
    if (!val.trim()) return "Le mot de passe est obligatoire.";
    if (val.length < 6) return "Minimum 6 caractères requis.";
    return undefined;
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setTouched({ email: true, password: true });

  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);

  if (emailErr || passErr) {
    setErrors({ email: emailErr, password: passErr });
    return;
  }

  setErrors({});
  setIsLoading(true);

  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    console.log('Réponse login:', data); // ← debug temporaire

    if (response.ok && data.token) {
      // ✅ Sauvegarder dans cookie (pas localStorage) pour que le middleware fonctionne
      document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 3600}`;
      
      // ✅ Redirection selon email vérifié et rôle
      if (!data.user?.email_verified_at) {
        window.location.href = '/verify-email';
      } else if (data.user?.role === 'admin') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/community';
      }
    } else {
      setErrors({ general: data.message || 'Identifiants incorrects' });
    }
  } catch (error) {
    setErrors({ general: 'Erreur de connexion au serveur' });
  } finally {
    setIsLoading(false);
  }
};

  const emailError = touched.email ? validateEmail(email) : errors.email;
  const passwordError = touched.password ? validatePassword(password) : errors.password;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── GAUCHE : Image dégradée ── */}
      <div className="hidden lg:flex flex-col justify-between px-16 py-14 lg:w-[48%] relative overflow-hidden">
        <img
          src="/images/maison.png"
          alt="Maison agricole"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center top' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(168,228,200,0.15) 0%,
              rgba(168,228,200,0.35) 20%,
              rgba(160,220,190,0.60) 45%,
              rgba(140,210,175,0.82) 65%,
              rgba(120,195,158,0.93) 80%,
              rgba(168,228,200,1.00) 100%
            )`,
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <Leaf className="w-6 h-6" style={{ color: '#047857' }} strokeWidth={2.5} />
          <span className="font-bold text-[18px]" style={{ color: '#047857' }}>AgriTech</span>
        </div>
        <div className="relative z-10">
          <h1 className="font-bold leading-tight mb-6" style={{ fontSize: 52, color: '#042f20', letterSpacing: '-0.02em' }}>
            Plateforme<br />Agricole<br />
            <span style={{ color: '#059669' }}>Intelligente</span>
            <span className="inline-block ml-3 text-4xl">🌱</span>
          </h1>
          <p className="text-[16px] leading-relaxed max-w-xs" style={{ color: '#1a5c3a' }}>
            Surveillez vos cultures, gérez vos exploitations et optimisez votre production grâce à la technologie.
          </p>
        </div>
        <p className="relative z-10 text-[13px]" style={{ color: '#3d7a5e' }}>© 2024 AgriTech Smart Systems</p>
      </div>

      {/* ── DROITE : Formulaire ── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-14"
        style={{ background: 'linear-gradient(180deg, #f0fdf8 0%, #e8faf2 100%)' }}
      >
        <div className="w-full max-w-[420px]">

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', boxShadow: '0 8px 24px rgba(5,150,105,0.28)' }}
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          </div>

          {/* Carte */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 16px 48px rgba(0,80,50,0.10), 0 2px 8px rgba(0,80,50,0.06)',
              border: '1px solid rgba(200,240,220,0.6)',
            }}
          >
            <div className="text-center mb-7">
              <h2 className="text-[24px] font-bold" style={{ color: '#042f20' }}>Connexion</h2>
              <p className="text-[14px] mt-1.5" style={{ color: '#6aab87' }}>
                Bienvenue sur votre plateforme agricole intelligente
              </p>
            </div>

            {/* Erreur générale */}
            {errors.general && (
              <div
                className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5"
                style={{
                  background: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)',
                  border: '1.5px solid rgba(239,68,68,0.25)',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.08)',
                }}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.12)' }}
                >
                  <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[13px] font-semibold" style={{ color: '#c53030' }}>Connexion échouée</p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#e05252' }}>{errors.general}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrors((p) => ({ ...p, general: undefined }))}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: '#f87171' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold" style={{ color: '#3d7a5e' }}>Email</label>
                <div
                  className="flex items-center gap-3 px-4 rounded-xl transition-all duration-200"
                  style={{
                    background: emailError ? 'rgba(254,242,242,0.8)' : '#edfaf3',
                    border: `1.5px solid ${emailError ? '#fca5a5' : '#b8e8d0'}`,
                    height: 52,
                    boxShadow: emailError ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
                  }}
                >
                  <svg
                    className="w-[18px] h-[18px] flex-shrink-0 transition-colors"
                    style={{ color: emailError ? '#f87171' : '#7ab89a' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) setErrors((p) => ({ ...p, email: validateEmail(e.target.value) }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    placeholder="agriculteur@agripulse.com"
                    className="flex-1 bg-transparent outline-none text-[14px]"
                    style={{ color: '#042f20' }}
                  />
                  {emailError && (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} />
                  )}
                </div>
                {emailError && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(252,165,165,0.4)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />
                    <p className="text-[12px] font-medium" style={{ color: '#dc2626' }}>{emailError}</p>
                  </div>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-semibold" style={{ color: '#3d7a5e' }}>Mot de passe</label>
                  <a href="/forgot-password" className="text-[13px] font-semibold transition-colors" style={{ color: '#059669' }}>
                    Oublié ?
                  </a>
                </div>
                <div
                  className="flex items-center gap-3 px-4 rounded-xl transition-all duration-200"
                  style={{
                    background: passwordError ? 'rgba(254,242,242,0.8)' : '#edfaf3',
                    border: `1.5px solid ${passwordError ? '#fca5a5' : '#b8e8d0'}`,
                    height: 52,
                    boxShadow: passwordError ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
                  }}
                >
                  <svg
                    className="w-[18px] h-[18px] flex-shrink-0 transition-colors"
                    style={{ color: passwordError ? '#f87171' : '#7ab89a' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) setErrors((p) => ({ ...p, password: validatePassword(e.target.value) }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-[14px]"
                    style={{ color: '#042f20' }}
                  />
                  {passwordError
                    ? <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} />
                    : (
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: '#7ab89a' }}>
                        {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    )
                  }
                </div>
                {passwordError && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(252,165,165,0.4)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />
                    <p className="text-[12px] font-medium" style={{ color: '#dc2626' }}>{passwordError}</p>
                  </div>
                )}
              </div>

              {/* Se souvenir */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only peer" />
                  <div
                    className="w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all"
                    style={{ borderColor: rememberMe ? '#059669' : '#a8d5bc', background: rememberMe ? '#059669' : 'transparent' }}
                  >
                    {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </div>
                <span className="text-[13px]" style={{ color: '#5a8a72' }}>Se souvenir de moi</span>
              </label>

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 4px 20px rgba(5,150,105,0.30)',
                  opacity: isLoading ? 0.8 : 1,
                }}
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion en cours…</>
                ) : 'Se connecter'}
              </button>

              {/* Séparateur */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: '#d4edd9' }} />
                <span className="text-[13px]" style={{ color: '#9ab8ac' }}>ou continuer avec</span>
                <div className="flex-1 h-px" style={{ background: '#d4edd9' }} />
              </div>

              {/* Google */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
                style={{ background: '#fff', border: '1.5px solid #d4edd9', color: '#2d4a3e', boxShadow: '0 2px 8px rgba(0,80,40,0.06)' }}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuer avec Google
              </button>
            </form>

            {/* Créer compte */}
            <div className="text-center mt-7">
              <a href="/register" className="text-[13px] font-semibold transition-colors" style={{ color: '#059669' }}>
                Pas de compte ? Inscrivez-vous
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}