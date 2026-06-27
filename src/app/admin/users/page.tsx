// src/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import VendorLayout from '@/components/layouts/VendorLayout';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;          // 'seller' | 'user' | 'admin'
  status: string;        // 'active' | 'pending' | 'suspended'
  created_at: string;
  shop?: { name: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, sellers, buyers, pending

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Erreur chargement utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: number, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'unsuspend';
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      toast.success(currentStatus === 'active' ? 'Utilisateur suspendu' : 'Utilisateur réactivé');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Filtres
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      activeFilter === 'all' ? true :
      activeFilter === 'sellers' ? user.role === 'seller' :
      activeFilter === 'buyers' ? user.role === 'user' :
      activeFilter === 'pending' ? user.status === 'pending' : true;
    return matchSearch && matchFilter;
  });

  // Statistiques
  const totalUsers = users.length;
  const newThisMonth = users.filter(u => {
    const d = new Date(u.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  if (loading) {
    return (
      <VendorLayout>
        <div className="min-h-screen bg-[#e6fff4] flex items-center justify-center">
          <div className="text-primary text-lg">Chargement...</div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
    <div className="min-h-screen bg-[#e6fff4] text-[#002118] selection:bg-primary-container selection:text-on-primary-container -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-bold text-2xl text-primary tracking-tight">Gestion des Utilisateurs</h1>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>
      </div>

      <main className="max-w-[1536px] mx-auto">
        {/* Stats Cards */}
       <section className="mb-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Carte 1 */}
    <div className="glass-card premium-shadow p-6 rounded-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 card-green-shadow-left">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
      <p className="font-medium text-sm text-on-surface-variant uppercase tracking-wider mb-2">Total Partenaires</p>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-primary">{totalUsers}</span>
        <span className="mb-1.5 text-xs font-bold text-emerald-500 flex items-center">
          <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> 4%
        </span>
      </div>
    </div>

    {/* Carte 2 */}
    <div className="glass-card premium-shadow p-6 rounded-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 card-green-shadow-left">
      <p className="font-medium text-sm text-on-surface-variant uppercase tracking-wider mb-2">Nouveaux</p>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-primary">+{newThisMonth}</span>
        <span className="mb-1.5 text-xs font-bold text-on-surface-variant/60">ce mois</span>
      </div>
    </div>

    {/* Carte 3 */}
    <div className="glass-card premium-shadow p-6 rounded-lg border-l-4 border-emerald-500 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 card-green-shadow-left">
      <p className="font-medium text-sm text-on-surface-variant uppercase tracking-wider mb-2">En attente de validation</p>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-error">{pendingUsers}</span>
        <span className="material-symbols-outlined text-error mb-1.5 animate-pulse">pending_actions</span>
      </div>
    </div>
  </div>
</section>

        {/* Filter Bar */}
        <section className="mb-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 pb-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'sellers', label: 'Vendeurs' },
              { key: 'buyers', label: 'Acheteurs' },
              { key: 'pending', label: 'En attente' },
              { key: 'reported', label: 'Signalés' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                  activeFilter === tab.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-secondary-container/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* User Cards Grid – identique au HTML */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const isPending = user.status === 'pending';
            const isSeller = user.role === 'seller';
            const badgeText = isPending ? 'En attente' : (isSeller ? 'Certifié' : 'Standard');
            const badgeClass = isPending
              ? 'bg-error-container/50 text-on-error-container'
              : (isSeller
                ? 'bg-success-container/50 text-on-secondary-container'
                : 'bg-secondary-container/50 text-on-secondary-container');

            return (
              <div
                key={user.id}
                className={`glass-card premium-shadow p-5 rounded-lg flex flex-col gap-4 group cursor-pointer hover:border-primary/30 transition-all duration-300 ${
                  isPending ? 'border-2 border-dashed border-outline-variant/40' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white ring-4 ring-primary/5 bg-surface-container-high flex items-center justify-center text-primary/40">
                      <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">{user.firstname} {user.lastname}</h3>
                      <p className="text-base text-on-surface-variant/80">{user.shop?.name || '-'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
                <div className="h-px bg-outline-variant/20 w-full"></div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">email</span>
                    <span className="text-base">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="text-base">Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="h-px bg-outline-variant/20 w-full mt-1"></div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSuspend(user.id, user.status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors active:scale-95 ${
                        user.status === 'active'
                          ? 'bg-surface-container-high text-on-surface-variant hover:bg-amber-100 hover:text-amber-800'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-green-100 hover:text-green-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{user.status === 'active' ? 'pause_circle' : 'play_circle'}</span>
                      <span className="text-xs font-medium">{user.status === 'active' ? 'Suspendre' : 'Réactiver'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container/40 text-error hover:bg-error-container hover:text-error transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      <span className="text-xs font-medium">Supprimer</span>
                    </button>
                  </div>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* FAB Inviter */}
      <button className="fixed bottom-24 right-6 md:bottom-12 md:right-12 bg-primary text-white px-8 py-4 rounded-full shadow-xl hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-50 group">
        <span className="material-symbols-outlined">person_add</span>
        <span className="font-medium text-sm">Inviter un utilisateur</span>
      </button>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 py-3 px-4 flex justify-around items-center z-50 rounded-t-xl shadow-[0_-4px_20px_rgba(6,44,34,0.08)]">
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold mt-1">Dashboard</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-5 py-1 active:scale-90">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-bold mt-0.5">Users</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold mt-1">Settings</span>
        </button>
      </nav>
    </div>
    </VendorLayout>
  );
}