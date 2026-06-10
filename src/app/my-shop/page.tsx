'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  unit_price?: number;
  stock: number;
  status: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  images: string[];
}

interface Shop {
  id: number;
  name: string;
  logo: string | null;
  banner: string | null;
  rating?: number;
  reviews_count?: number;
}

export default function MaBoutique() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'outofstock'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Récupération parallèle du profil boutique et des produits
        const [shopRes, productsRes] = await Promise.all([
          api.get('/my-shop/profile'),
          api.get('/my-shop/products')
        ]);
        setShop(shopRes.data.data);
        setProducts(productsRes.data.data || []);
      } catch (err: any) {
        console.error('Erreur API:', err);
        const message = err.response?.data?.message || 'Impossible de charger les données';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ? true
      : filterStatus === 'active' ? product.status === 'active'
      : product.status === 'outofstock';
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    try {
      await api.delete(`/marketplace/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produit supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (id: number) => router.push(`/edit-product/${id}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Chargement de votre boutique...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="text-error text-xl mb-4">⚠️ Une erreur est survenue</div>
        <div className="text-on-surface-variant mb-6">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-on-primary rounded-full"
        >
          Réessayer
        </button>
      </div>
    );
  }
console.log(shop);
  return (
    <div className="min-h-screen bg-background text-on-background pb-12">
      {/* Header fixe */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <Menu className="text-primary cursor-pointer" />
          <h1 className="font-bold text-primary text-2xl">AgriConnect</h1>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="text-primary" />
          <div className="w-8 h-8 rounded-full bg-primary-container"></div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto pt-24 px-6 space-y-8">
        {/* Section Hero avec bannière et logo dynamiques */}
        <section className="relative h-64 rounded-3xl overflow-hidden shadow-xl">
      <img
  src={
    shop?.banner ||
    'https://picsum.photos/1920/400?grayscale'
  }
  className="w-full h-full object-cover"
  alt="Bannière boutique"
/>
        
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-6 left-6 flex items-end justify-between w-[95%] text-white">
            <div className="flex items-center gap-4">
            
           <img
  src={
    shop?.logo ||
    'https://picsum.photos/96/96?random=1'
  }
  className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg object-cover"
  alt="Logo boutique"
/>
               
              <div>
                <h2 className="text-3xl font-bold">{shop?.name || 'Ma Boutique'}</h2>
                <p className="text-sm text-primary-fixed-dim">
                  ★ {shop?.rating || '4.9'} ({shop?.reviews_count || 124} avis) • Vendeur Premium
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-full text-center">
                <p className="font-bold text-xl">{products.length}</p>
                <p className="text-[10px] uppercase">Produits</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-full text-center">
                <p className="font-bold text-xl">98%</p>
                <p className="text-[10px] uppercase">Fiabilité</p>
              </div>
            </div>
          </div>
        </section>

        {/* Barre de recherche et filtres */}
        <section className="flex flex-wrap items-center gap-3 bg-transparent p-0 shadow-none">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-primary" size={20} />
            <input
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary-container"
              placeholder="Rechercher dans mes produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-6 py-4 bg-surface-container-high rounded-full text-sm font-medium flex items-center gap-2">
            <Filter size={18} /> Filtrer
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-4 rounded-full text-sm font-semibold ${
              filterStatus === 'all'
                ? 'bg-primary-container/10 border border-primary-container text-primary'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            Toutes les catégories
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-6 py-4 rounded-full text-sm font-medium ${
              filterStatus === 'active'
                ? 'bg-primary-container/10 border border-primary-container text-primary'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            Actifs
          </button>
          <button
            onClick={() => setFilterStatus('outofstock')}
            className={`px-6 py-4 rounded-full text-sm font-medium ${
              filterStatus === 'outofstock'
                ? 'bg-primary-container/10 border border-primary-container text-primary'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            Rupture
          </button>
          <button
            onClick={() => router.push('/add-product')}
            className="px-6 py-4 bg-primary text-on-primary rounded-full font-bold flex items-center gap-2 shadow-md hover:scale-105 transition"
          >
            <Plus size={18} /> Ajouter
          </button>
        </section>

        {/* Grille des produits */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            Aucun produit trouvé. Cliquez sur "Ajouter" pour commencer.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-surface-container-lowest rounded-[2rem] border border-outline-variant/30 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="relative h-60 w-full rounded-t-[2rem] overflow-hidden">
                  <img
                    src={p.images?.[0] || '/placeholder.png'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={p.name}
                  />
                  {/* Badge de statut */}
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'active'
                        ? 'bg-primary-container text-on-primary-container'
                        : p.status === 'outofstock'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-tertiary-container text-on-tertiary-container'
                    }`}
                  >
                    {p.status === 'active' ? 'Actif' : p.status === 'outofstock' ? 'Rupture' : 'En attente'}
                  </span>
                  
                  {/* Badge d'approbation */}
                {/* Badge de statut d'approbation */}
{(() => {
  const status = p.approval_status;
  if (status === 'approved') {
    return (
      <span className="absolute top-3 left-40 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-600 text-white shadow-sm">
        ✓ Vérifié
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="absolute top-3 left-40 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white shadow-sm">
        ⏱ En attente
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span
        className="absolute top-3 left-40 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-600 text-white shadow-sm"
        title={p.rejection_reason ? `Rejeté : ${p.rejection_reason}` : 'Produit rejeté'}
      >
        ✗ Rejeté
      </span>
    );
  }
  return (
    <span className="absolute top-3 left-40 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-500 text-white shadow-sm">
      ℹ Statut inconnu
    </span>
  );
})()}
                  
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(p.id)}
                      className="bg-white/80 backdrop-blur-md p-2 rounded-full text-blue-600 hover:bg-white"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-white/80 backdrop-blur-md p-2 rounded-full text-red-600 hover:bg-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3 flex-grow flex flex-col justify-center">
                  <h3 className="font-bold text-sm leading-tight text-on-surface">{p.name}</h3>
                  <div className="flex justify-between items-center border-t border-outline-variant/30 mt-2 pt-2">
                    <div>
                      <p className="text-[10px] text-outline uppercase">Prix</p>
                      <p className="text-md font-bold text-primary">
                        {Math.floor(p.price)} FCFA
                        {p.unit_price && <span className="text-[10px] font-normal"> / {p.unit_price}</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-outline uppercase">Stock</p>
                      <p className="text-xs font-semibold text-on-surface">{p.stock} unités</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}