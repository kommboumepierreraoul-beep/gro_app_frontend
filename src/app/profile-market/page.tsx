'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2, X, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Theme = 'light' | 'dark';
type Modal = 'edit' | 'password' | null;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [ordersCount, setOrdersCount] = useState(0);
  const [disputesOpen, setDisputesOpen] = useState(0);
  const [walletBalance, setWalletBalance] = useState('0');
  const [walletCredited, setWalletCredited] = useState('0');
  const [theme, setTheme] = useState<Theme>('light');
  const [modal, setModal] = useState<Modal>(null);
  const [editForm, setEditForm] = useState({ firstname: '', lastname: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('app_theme') as Theme;
    if (saved) setTheme(saved);
    Promise.all([
      api.get('/auth/profile'),
      api.get('/orders'),
      api.get('/disputes'),
      api.get('/wallet/balance'),
    ]).then(([profileRes, ordersRes, disputesRes, walletRes]) => {
      const u = profileRes.data.user;
      setUser(u);
      setFirstname(u.firstname || '');
      setLastname(u.lastname || '');
      setPhone(u.phone || '');
      setEditForm({ firstname: u.firstname || '', lastname: u.lastname || '', phone: u.phone || '' });
      setOrdersCount(ordersRes.data.data?.length || 0);
      setDisputesOpen(disputesRes.data.data?.filter((d: any) => ['pending','negotiation','escalated'].includes(d.status)).length || 0);
      setWalletBalance(walletRes.data.balance || '0');
      setWalletCredited(walletRes.data.total_credited || '0');
    }).catch(() => toast.error('Impossible de charger le profil'))
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('app_theme', next);
  };

  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#0a1f17' : '#e6fff4',
    surface: isDark ? 'rgba(20,40,30,0.85)' : 'rgba(255,255,255,0.75)',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
    text: isDark ? '#d2f9e9' : '#002118',
    textSub: isDark ? '#6c9e82' : '#6c7a71',
    divider: isDark ? '#1e3d2f' : '#f0f0f0',
    header: isDark ? 'rgba(10,31,23,0.85)' : 'rgba(230,255,244,0.8)',
    input: isDark ? '#0d2b1e' : '#d5fcec',
    shadow: isDark ? '0 4px 32px rgba(0,0,0,0.4)' : '0 4px 32px rgba(6,44,34,0.08)',
  };

  const avatarUrl = user?.profile?.avatar_url
    || `https://ui-avatars.com/api/?background=006c49&color=fff&bold=true&size=256&name=${encodeURIComponent(`${firstname} ${lastname}`)}`;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data.user);
      toast.success('Photo mise à jour');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', editForm);
      setUser(res.data.user);
      setFirstname(editForm.firstname);
      setLastname(editForm.lastname);
      setPhone(editForm.phone);
      toast.success('Profil mis à jour');
      setModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.password !== pwForm.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSavingPw(true);
    try {
      await api.put('/auth/password', pwForm);
      toast.success('Mot de passe modifié avec succès');
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
      setModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mot de passe actuel incorrect');
    } finally { setSavingPw(false); }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('auth_token');
      router.push('/login');
      toast.success('Déconnecté');
    } catch { toast.error('Erreur'); }
  };

  const roleLabel: Record<string, string> = {
    user: 'Acheteur', seller: 'Vendeur Premium', admin: 'Administrateur',
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cardStyle = {
    background: colors.surface,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '24px',
    boxShadow: colors.shadow,
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: 'Inter, sans-serif', transition: 'background 0.3s' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full" style={{ background: colors.header, backdropFilter: 'blur(20px)', borderBottom: `1px solid rgba(187,202,191,0.3)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold bg-transparent border-none cursor-pointer hover:opacity-80 transition">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">arrow_back</span>
              <span className="text-sm sm:text-base hidden sm:inline">Retour</span>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: colors.text, letterSpacing: '-0.01em' }}>User Profile</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleTheme}
              className="w-12 h-7 sm:w-14 sm:h-8 rounded-full border-none cursor-pointer relative flex-shrink-0 transition-colors duration-300"
              style={{ background: isDark ? '#006c49' : '#bbcabf' }}>
              <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white transition-all duration-300 flex items-center justify-center"
                style={{ left: isDark ? 'calc(100% - 28px)' : '4px', top: isDark ? '4px' : '4px' }}>
                <span className="material-symbols-outlined text-xs sm:text-sm" style={{ color: isDark ? '#006c49' : '#6c7a71' }}>{isDark ? 'dark_mode' : 'light_mode'}</span>
              </div>
            </button>
            <button className="hidden sm:flex items-center gap-2 text-sm font-medium bg-transparent border-none cursor-pointer hover:opacity-80 transition" style={{ color: colors.textSub }}>
              <span className="material-symbols-outlined">help_outline</span>
              <span>Support</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 pb-32">

        {/* Card hero */}
        <div style={{ ...cardStyle, padding: '24px sm:28px md:32px', marginBottom: '24px' }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
            <div className="relative flex-shrink-0">
              <img src={avatarUrl} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-[#d5fcec] dark:border-[#13362c] shadow-lg" alt="Avatar" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 border-none rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-700 transition disabled:opacity-50"
                style={{ boxShadow: '0 2px 8px rgba(0,108,73,0.4)' }}>
                {uploadingAvatar ? <Loader2 size={13} color="white" className="animate-spin" /> : <span className="material-symbols-outlined text-sm text-white">photo_camera</span>}
              </button>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="flex-1 min-w-0 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: colors.text, margin: 0 }}>{firstname} {lastname}</h2>
                <span className="text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block" style={{ background: '#cff6e6', color: '#006c49' }}>
                  {roleLabel[user?.role] || user?.role}
                </span>
              </div>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-sm" style={{ color: colors.textSub }}>
                <span className="material-symbols-outlined text-base">mail</span>{user?.email}
              </p>
              {phone && <p className="flex items-center justify-center sm:justify-start gap-2 text-sm" style={{ color: colors.textSub }}>
                <span className="material-symbols-outlined text-base">phone</span>{phone}
              </p>}
              <p className="flex items-center justify-center sm:justify-start gap-2 text-sm" style={{ color: colors.textSub }}>
                <span className="material-symbols-outlined text-base">calendar_today</span>
                Membre depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <button onClick={() => { setEditForm({ firstname, lastname, phone }); setModal('edit'); }}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white border-none rounded-full font-bold text-sm cursor-pointer shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #006c49, #2c694e)' }}>
                <span className="material-symbols-outlined text-base">edit</span>
                <span className="hidden sm:inline">Modifier le profil</span>
                <span className="sm:hidden">Modifier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats - 4 colonnes sur desktop, 2 sur tablette, 1 sur mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          {[
            { icon: 'shopping_cart', label: 'Achats Effectués', value: ordersCount, sub: 'Transactions', bg: '#cff6e6', color: '#006c49', link: '/orders' },
            { icon: 'balance', label: 'Litiges Ouverts', value: disputesOpen, sub: 'Incidents', bg: disputesOpen > 0 ? '#ffdad6' : '#cff6e6', color: disputesOpen > 0 ? '#ba1a1a' : '#006c49', link: '/disputes' },
            { icon: 'account_balance_wallet', label: 'Portefeuille', value: Number(walletBalance).toLocaleString('fr-FR'), sub: 'FCFA disponible', bg: '#d5fcec', color: '#006c49', link: '/wallet' },
            { icon: 'trending_up', label: 'Total crédité', value: Number(walletCredited).toLocaleString('fr-FR'), sub: 'FCFA reçus', bg: '#cff6e6', color: '#2c694e', link: '/wallet' },
          ].map((s, i) => (
            <Link href={s.link} key={i} className="no-underline">
              <div style={{ 
                ...cardStyle, 
                padding: '20px 24px', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '120px'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: s.color }}>{s.icon}</span>
                  </div>
                </div>
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSub, margin: '0 0 4px' }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: colors.text, margin: '0 0 2px' }}>{s.value}</p>
                <p className="text-xs" style={{ color: colors.textSub, margin: 0 }}>{s.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Infos + Sécurité */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="material-symbols-outlined" style={{ color: colors.textSub }}>person</span>
              <h3 className="text-sm sm:text-base font-bold" style={{ color: colors.text, margin: 0 }}>Informations Personnelles</h3>
            </div>
            {[
              { label: 'Prénom', value: firstname, icon: 'badge' },
              { label: 'Nom', value: lastname, icon: 'person_outline' },
              { label: 'Téléphone', value: phone || '—', icon: 'phone' },
              { label: 'Email', value: user?.email || '', icon: 'mail' },
            ].map((field, i) => (
              <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: i < 3 ? `1px solid ${colors.divider}` : 'none' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-base sm:text-xl flex-shrink-0" style={{ color: colors.textSub }}>{field.icon}</span>
                  <span className="text-xs sm:text-sm font-medium truncate" style={{ color: colors.text }}>{field.label}</span>
                </div>
                <span className="text-xs sm:text-sm truncate ml-2" style={{ color: colors.textSub }}>{field.value}</span>
              </div>
            ))}
            <button onClick={() => { setEditForm({ firstname, lastname, phone }); setModal('edit'); }}
              className="mt-4 w-full py-3 text-white border-none rounded-full text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #006c49, #2c694e)' }}>
              <span className="material-symbols-outlined text-base">edit</span>
              Modifier mes informations
            </button>
          </div>

          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="material-symbols-outlined" style={{ color: colors.textSub }}>shield</span>
              <h3 className="text-sm sm:text-base font-bold" style={{ color: colors.text, margin: 0 }}>Sécurité</h3>
            </div>
            {[
              { icon: 'lock_reset', label: 'Changer de mot de passe', sub: '', action: () => setModal('password') },
              { icon: 'verified_user', label: 'Authentification 2FA', sub: 'Non activée', action: () => {} },
              { icon: 'devices', label: 'Appareils connectés', sub: '1 actif', action: () => {} },
            ].map((item, i) => (
              <button key={i} onClick={item.action} 
                className="w-full flex items-center justify-between py-3 cursor-pointer bg-transparent border-0"
                style={{ 
                  borderBottom: i < 2 ? `1px solid ${colors.divider}` : 'none',
                  borderRadius: 0,
                  paddingLeft: 0,
                  paddingRight: 0
                }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-base sm:text-xl flex-shrink-0" style={{ color: colors.textSub }}>{item.icon}</span>
                  <div className="text-left min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate" style={{ color: colors.text, margin: 0 }}>{item.label}</p>
                    {item.sub && <p className="text-[10px] sm:text-xs truncate" style={{ color: colors.textSub, margin: 0 }}>{item.sub}</p>}
                  </div>
                </div>
                <span className="material-symbols-outlined text-base flex-shrink-0 ml-2" style={{ color: '#bbcabf' }}>chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activité + Préférences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="material-symbols-outlined" style={{ color: colors.textSub }}>storefront</span>
              <h3 className="text-sm sm:text-base font-bold" style={{ color: colors.text, margin: 0 }}>Activité Marketplace</h3>
            </div>
            {[
              { icon: 'list_alt', label: 'Mes commandes', badge: ordersCount > 0 ? `${ordersCount} commande${ordersCount > 1 ? 's' : ''}` : null, link: '/orders', badgeRed: false },
              { icon: 'balance', label: 'Mes litiges', badge: disputesOpen > 0 ? `${disputesOpen} ouvert${disputesOpen > 1 ? 's' : ''}` : null, link: '/disputes', badgeRed: disputesOpen > 0 },
              { icon: 'account_balance_wallet', label: 'Mon portefeuille', badge: null, link: '/wallet', badgeRed: false },
            ].map((item, i) => (
              <Link href={item.link} key={i} className="no-underline">
                <div className="flex items-center justify-between py-3 cursor-pointer" style={{ borderBottom: i < 2 ? `1px solid ${colors.divider}` : 'none' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-base sm:text-xl flex-shrink-0" style={{ color: colors.textSub }}>{item.icon}</span>
                    <span className="text-xs sm:text-sm font-medium truncate" style={{ color: colors.text }}>{item.label}</span>
                  </div>
                  {item.badge
                    ? <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2" style={{ background: item.badgeRed ? '#ffdad6' : '#cff6e6', color: item.badgeRed ? '#ba1a1a' : '#006c49' }}>{item.badge}</span>
                    : <span className="material-symbols-outlined text-base flex-shrink-0 ml-2" style={{ color: '#bbcabf' }}>chevron_right</span>}
                </div>
              </Link>
            ))}
          </div>

          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="material-symbols-outlined" style={{ color: colors.textSub }}>settings</span>
              <h3 className="text-sm sm:text-base font-bold" style={{ color: colors.text, margin: 0 }}>Préférences</h3>
            </div>
            {[
              { icon: 'notifications', label: 'Notifications', sub: 'Push & Email' },
              { icon: 'language', label: 'Langue', sub: 'Français (FR)' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 cursor-pointer" style={{ borderBottom: `1px solid ${colors.divider}` }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-base sm:text-xl flex-shrink-0" style={{ color: colors.textSub }}>{item.icon}</span>
                  <span className="text-xs sm:text-sm font-medium truncate" style={{ color: colors.text }}>{item.label}</span>
                </div>
                <span className="text-[10px] sm:text-xs flex-shrink-0 ml-2" style={{ color: colors.textSub }}>{item.sub}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-base sm:text-xl flex-shrink-0" style={{ color: colors.textSub }}>palette</span>
                <span className="text-xs sm:text-sm font-medium truncate" style={{ color: colors.text }}>Thème visuel</span>
              </div>
              <button onClick={toggleTheme}
                className="w-12 h-6 sm:w-14 sm:h-7 rounded-full border-none cursor-pointer relative flex-shrink-0 ml-2 transition-colors duration-300"
                style={{ background: isDark ? '#006c49' : '#bbcabf' }}>
                <div className="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white transition-all duration-300 flex items-center justify-center"
                  style={{ left: isDark ? 'calc(100% - 20px)' : '4px', top: '4px' }}>
                  <span className="material-symbols-outlined text-[10px] sm:text-xs" style={{ color: isDark ? '#006c49' : '#6c7a71' }}>{isDark ? 'dark_mode' : 'light_mode'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Aide */}
        <div style={{ ...cardStyle, textAlign: 'center', marginBottom: '16px' }}>
          <p className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.text }}>Besoin d'aide avec votre compte ?</p>
          <p className="text-sm sm:text-base max-w-lg mx-auto mb-5" style={{ color: colors.textSub }}>Notre équipe est disponible 7j/7 pour vous accompagner.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 text-white border-none rounded-full font-bold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #006c49, #2c694e)' }}>
              Consulter la FAQ
            </button>
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95" style={{ background: 'transparent', color: '#006c49', border: '2px solid #aeeecb' }}>
              Contacter un expert
            </button>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-red-50 dark:hover:bg-red-900/20" style={{ background: 'transparent', border: '2px solid #ffdad6', color: '#ba1a1a' }}>
          <span className="material-symbols-outlined text-base">logout</span>
          Se déconnecter
        </button>
      </main>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 sm:gap-6 md:gap-10 lg:gap-14 bg-slate-800/90 backdrop-blur-md px-4 sm:px-5 py-2 rounded-full shadow-lg border border-white/10">
        <Link href="/marketplace" className="flex flex-col items-center text-white/70 hover:text-emerald-300 transition">
          <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl">storefront</span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold mt-0.5">Market</span>
        </Link>
        <Link href="/my-shop" className="flex flex-col items-center text-white/70 hover:text-emerald-300 transition">
          <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl">store</span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold mt-0.5">Ma boutique</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center text-white/70 hover:text-emerald-300 transition">
          <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl">shopping_bag</span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold mt-0.5">Commandes</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-emerald-400">
          <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl">person</span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold mt-0.5">Profil</span>
        </Link>
      </div>

      {/* MODAL EDIT PROFIL */}
      {modal === 'edit' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="rounded-3xl p-6 sm:p-8 w-full max-w-md" style={{ background: isDark ? '#0d2b1e' : 'white', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.text, margin: 0 }}>Modifier le profil</h2>
              <button onClick={() => setModal(null)} className="bg-transparent border-none cursor-pointer" style={{ color: colors.textSub }}>
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Prénom', key: 'firstname', value: editForm.firstname },
                { label: 'Nom', key: 'lastname', value: editForm.lastname },
                { label: 'Téléphone', key: 'phone', value: editForm.phone },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: colors.textSub }}>{field.label}</label>
                  <input
                    value={field.value}
                    onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none box-border transition-colors duration-300"
                    style={{ background: isDark ? '#0a1f17' : '#d5fcec', border: '2px solid transparent', color: colors.text, fontFamily: 'Inter' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer" style={{ background: 'transparent', border: `2px solid ${colors.divider}`, color: colors.textSub }}>
                Annuler
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-[2] py-3 text-white border-none rounded-full text-sm font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #006c49, #2c694e)' }}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MOT DE PASSE */}
      {modal === 'password' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="rounded-3xl p-6 sm:p-8 w-full max-w-md" style={{ background: isDark ? '#0d2b1e' : 'white', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.text, margin: 0 }}>Changer le mot de passe</h2>
              <button onClick={() => setModal(null)} className="bg-transparent border-none cursor-pointer" style={{ color: colors.textSub }}>
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Mot de passe actuel', key: 'current_password', show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
                { label: 'Nouveau mot de passe', key: 'password', show: showPw.new, toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
                { label: 'Confirmer le nouveau mot de passe', key: 'password_confirmation', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: colors.textSub }}>{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.show ? 'text' : 'password'}
                      value={(pwForm as any)[field.key]}
                      onChange={e => setPwForm({ ...pwForm, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none box-border transition-colors duration-300"
                      style={{ background: isDark ? '#0a1f17' : '#d5fcec', border: '2px solid transparent', color: colors.text, fontFamily: 'Inter' }}
                    />
                    <button onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer" style={{ color: colors.textSub }}>
                      {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer" style={{ background: 'transparent', border: `2px solid ${colors.divider}`, color: colors.textSub }}>
                Annuler
              </button>
              <button onClick={handleChangePassword} disabled={savingPw} className="flex-[2] py-3 text-white border-none rounded-full text-sm font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #006c49, #2c694e)' }}>
                {savingPw ? <><Loader2 size={14} className="animate-spin" /> Modification...</> : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}