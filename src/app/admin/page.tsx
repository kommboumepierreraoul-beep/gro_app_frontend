'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminService, PendingProduct, ActivityLog, AnalyticsData } from '@/services/admin.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, activitiesRes, analyticsRes] = await Promise.all([
        adminService.getPendingProducts(),
        adminService.getActivityLog(15),
        adminService.getAnalytics()
      ]);

      setPendingProducts(pendingRes.data || []);
      setActivities(activitiesRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Approuver un produit
  const handleApproveProduct = async (productId: number) => {
    try {
      setActionLoading(productId);
      await adminService.approveProduct(productId);
      toast.success('Produit approuvé !');
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      loadData(); // Rafraîchir la timeline
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  // Rejeter un produit
  const handleRejectProduct = async (productId: number) => {
  const reason = window.prompt('Raison du rejet (obligatoire) :');
  if (reason === null) return; // annulation
  if (!reason.trim()) {
    toast.error('Veuillez saisir une raison pour le rejet');
    return;
  }
  try {
    setActionLoading(productId);
    await adminService.rejectProduct(productId, reason);
    toast.success('Produit rejeté. L\'utilisateur sera notifié.');
    // Retirer le produit de la liste
    setPendingProducts(prev => prev.filter(p => p.id !== productId));
    await loadData(); // rafraîchir la timeline
  } catch (err: any) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Erreur lors du rejet');
  } finally {
    setActionLoading(null);
  }
};
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'product_added':
        return '#064c36';
      case 'product_approved':
        return '#1b9e4b';
      case 'product_rejected':
        return '#ba1a1a';
      case 'user_joined':
        return '#2c694e';
      default:
        return '#5c625e';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8faf9' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" style={{ borderColor: '#064c36' }}></div>
          <p className="text-on-surface-variant">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body min-h-screen pb-24 md:pb-0" style={{ backgroundColor: '#f8faf9', color: '#1a1c1b' }}>
      <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline/50" style={{ borderColor: '#e0e4e2' }}>
        <div className="flex justify-between items-center px-6 md:px-12 h-16 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-primary" style={{ color: '#064c36' }}>
              <span className="material-symbols-outlined text-3xl block" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-primary uppercase text-[13px] tracking-widest" style={{ color: '#064c36' }}>AgriConnect Admin</h1>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="bg-primary pt-8 pb-4 px-6 md:px-12" style={{ backgroundColor: '#064c36' }}>
          <div className="max-w-screen-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Tableau de bord</h2>
            <p className="text-white/60 text-sm">Gestion de l'approbation des produits et de la plateforme</p>
          </div>
        </section>

        <section className="stats-hero pb-24 px-6 md:px-12 pt-6" style={{ background: 'linear-gradient(180deg, #064c36 0%, #086648 100%)' }}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-6 rounded-xl text-white">
                <div className="flex justify-between items-start mb-6">
                  <span className="material-symbols-outlined text-white/60">verified_user</span>
                </div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Approbations en attente</p>
                <h3 className="text-3xl font-bold">{analytics?.pending_approvals || 0}</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-6 rounded-xl text-white">
                <div className="flex justify-between items-start mb-6">
                  <span className="material-symbols-outlined text-white/60">group</span>
                </div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Utilisateurs actifs</p>
                <h3 className="text-3xl font-bold">{analytics?.active_users || 0}</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-6 rounded-xl text-white">
                <div className="flex justify-between items-start mb-6">
                  <span className="material-symbols-outlined text-white/60">payments</span>
                </div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Ventes totales</p>
                <h3 className="text-3xl font-bold">{analytics?.total_sales?.toLocaleString() || 0} €</h3>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 -mt-12 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Link href="/admin/users" className="glass-card premium-card p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-surface-variant/50 transition-all group cursor-pointer" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary transition-colors"><span className="material-symbols-outlined text-primary group-hover:text-white">group</span></div>
                <div><h3 className="text-md font-bold text-on-surface">Gestion des Utilisateurs</h3><p className="text-xs text-on-surface-variant">{analytics?.active_users || 0} utilisateurs actifs</p></div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
            </Link>
            <Link href="/admin/catalog" className="glass-card premium-card p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-surface-variant/50 transition-all group cursor-pointer" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary transition-colors"><span className="material-symbols-outlined text-primary group-hover:text-white">inventory_2</span></div>
                <div><h3 className="text-md font-bold text-on-surface">Catalogue de Produits</h3><p className="text-xs text-on-surface-variant">Gestion des produits</p></div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant" style={{ color: '#5c625e' }}>
                  Produits en attente ({pendingProducts.length})
                </h3>
              </div>
              
              {pendingProducts.length === 0 ? (
                <div className="glass-card premium-card p-8 rounded-xl text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mx-auto block mb-2">check_circle</span>
                  <p className="text-on-surface-variant">Aucun produit en attente d'approbation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProducts.map((product) => (
                    <div key={product.id} className="glass-card premium-card p-4 rounded-xl flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative w-full sm:w-32 h-24 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                        <img
                          alt={product.name}
                          className="w-full h-full object-cover"
                          src={
                            product.images && Array.isArray(product.images) && product.images.length > 0
                              ? product.images[0]
                              : 'https://via.placeholder.com/128x96?text=No+Image'
                          }
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x96?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="flex-grow text-center sm:text-left">
                        <h4 className="text-md font-bold text-on-surface mb-0.5">{product.name}</h4>
                        <p className="text-on-surface-variant text-xs font-medium mb-2 flex items-center justify-center sm:justify-start gap-1">
                          <span className="material-symbols-outlined text-[14px]">store</span>
                          {product.shop?.name}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {product.category?.name}
                          </span>
                          <span className="text-on-surface-variant/60 text-[10px] font-medium uppercase">
                            {new Date(product.created_at).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link href={`/admin/product/${product.id}`}>
                          <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-outline text-on-surface text-xs font-bold hover:bg-surface-variant transition-colors">
                            Voir
                          </button>
                        </Link>
                        <button
                          onClick={() => handleRejectProduct(product.id)}
                          disabled={actionLoading === product.id}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-error/20 text-error text-xs font-bold hover:bg-error/5 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === product.id ? '...' : 'Rejeter'}
                        </button>
                        <button
                          onClick={() => handleApproveProduct(product.id)}
                          disabled={actionLoading === product.id}
                          className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-light transition-all shadow-md active:scale-95 disabled:opacity-50"
                          style={{ backgroundColor: '#064c36' }}
                        >
                          {actionLoading === product.id ? '...' : 'Approuver'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

           <aside className="lg:col-span-4">
  <div className="sticky top-24">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">timeline</span>
            <h3 className="text-sm font-semibold text-gray-800">Activités récentes</h3>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {activities.length}
          </span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        <div className="relative pl-6 pr-4 py-3 space-y-5">
          {/* Ligne verticale de fond */}
          <div className="absolute left-[1.125rem] top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-transparent"></div>

          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Aucune activité récente</div>
          ) : (
            activities.map((activity, idx) => (
              <div key={activity.id} className="relative group">
                {/* Cercle indicateur */}
                <div
                  className="absolute -left-[1.625rem] top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-125"
                  style={{ backgroundColor: getActivityColor(activity.type) }}
                ></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span
                      className="font-medium uppercase tracking-wide"
                      style={{ color: getActivityColor(activity.type) }}
                    >
                      {activity.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(activity.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
</aside>
          </div>
        </div>
      </main>

      <nav className="bg-white/95 backdrop-blur-xl fixed bottom-0 w-full z-50 border-t border-outline/50 md:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link href="/admin" className="flex flex-col items-center justify-center" style={{ color: '#064c36' }}>
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex flex-col items-center justify-center text-on-surface-variant/70">
            <span className="material-symbols-outlined text-[22px]">group</span>
            <span className="text-[10px] mt-0.5 tracking-tight">Users</span>
          </Link>
          <Link href="/admin/catalog" className="flex flex-col items-center justify-center text-on-surface-variant/70">
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            <span className="text-[10px] mt-0.5 tracking-tight">Catalog</span>
          </Link>
        </div>
      </nav>

      <footer className="hidden md:block py-12 px-12 border-t border-outline/50 bg-white">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl" style={{ color: '#064c36' }}>agriculture</span>
            <span className="font-bold text-xs uppercase tracking-widest text-primary" style={{ color: '#064c36' }}>AgriConnect Admin</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/50 font-medium tracking-tight">© 2026 AgriConnect Platform</p>
        </div>
      </footer>
    </div>
  );
}
