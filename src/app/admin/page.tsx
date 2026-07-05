'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminService, PendingProduct, ActivityLog, AnalyticsData } from '@/services/admin.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Package,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
} from 'lucide-react';

function AdminDashboardContent() {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, activitiesRes, analyticsRes] = await Promise.all([
        adminService.getPendingProducts(),
        adminService.getActivityLog(15),
        adminService.getAnalytics()
      ]);
      setPendingProducts(
        (pendingRes.data || []).filter(
          (product: PendingProduct) =>
            !product.approval_status || product.approval_status === "pending",
        ),
      );
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
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleApproveProduct = async (productId: number) => {
    try {
      setActionLoading(productId);
      await adminService.approveProduct(productId);
      toast.success('Produit approuvé !');
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProduct = async (productId: number) => {
    const reason = window.prompt('Raison du rejet (obligatoire) :');
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Veuillez saisir une raison pour le rejet');
      return;
    }
    try {
      setActionLoading(productId);
      await adminService.rejectProduct(productId, reason);
      toast.success('Produit rejeté. L\'utilisateur sera notifié.');
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setActionLoading(null);
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'product_added': return '#064c36';
      case 'product_approved': return '#1b9e4b';
      case 'product_rejected': return '#ba1a1a';
      case 'user_joined': return '#2c694e';
      default: return '#5c625e';
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
    <>
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
              <div className="flex justify-between items-start mb-6"><ShieldCheck className="h-5 w-5 text-white/60" /></div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Approbations en attente</p>
              <h3 className="text-3xl font-bold">{analytics?.pending_approvals || 0}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-6 rounded-xl text-white">
              <div className="flex justify-between items-start mb-6"><Users className="h-5 w-5 text-white/60" /></div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Utilisateurs actifs</p>
              <h3 className="text-3xl font-bold">{analytics?.active_users || 0}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-6 rounded-xl text-white">
              <div className="flex justify-between items-start mb-6"><WalletCards className="h-5 w-5 text-white/60" /></div>
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
              <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary transition-colors"><Users className="h-5 w-5 text-primary group-hover:text-white" /></div>
              <div><h3 className="text-md font-bold text-on-surface">Gestion des Utilisateurs</h3><p className="text-xs text-on-surface-variant">{analytics?.active_users || 0} utilisateurs actifs</p></div>
            </div>
            <ArrowRight className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
          </Link>
          <Link href="/admin/catalog" className="glass-card premium-card p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-surface-variant/50 transition-all group cursor-pointer" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary transition-colors"><Package className="h-5 w-5 text-primary group-hover:text-white" /></div>
              <div><h3 className="text-md font-bold text-on-surface">Catalogue de Produits</h3><p className="text-xs text-on-surface-variant">Gestion des produits</p></div>
            </div>
            <ArrowRight className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
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
                <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-on-surface-variant/30" />
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
                        <Store className="h-3.5 w-3.5" />
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
                      <Activity className="h-5 w-5 text-primary" />
                      <h3 className="text-sm font-semibold text-gray-800">Activités récentes</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{activities.length}</span>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="relative pl-6 pr-4 py-3 space-y-5">
                    <div className="absolute left-[1.125rem] top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-transparent"></div>
                    {activities.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">Aucune activité récente</div>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="relative group">
                          <div className="absolute -left-[1.625rem] top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-125" style={{ backgroundColor: getActivityColor(activity.type) }}></div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{activity.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="font-medium uppercase tracking-wide" style={{ color: getActivityColor(activity.type) }}>{activity.category}</span>
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
    </>
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
