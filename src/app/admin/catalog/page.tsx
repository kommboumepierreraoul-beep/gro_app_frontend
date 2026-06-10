'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminService } from '@/services/admin.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
  category?: { name: string };
  shop?: { name: string };
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function ManageCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        adminService.getAllProducts(),
        adminService.getCategories()
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    try {
      setActionLoading(productId);
      await adminService.deleteProductFromCatalog(productId);
      toast.success('Produit supprimé');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      setActionLoading(categoryId);
      await adminService.deleteCategory(categoryId);
      toast.success('Catégorie supprimée');
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Entrez un nom de catégorie');
      return;
    }
    try {
      setActionLoading(-1);
      const res = await adminService.createCategory(newCategory);
      toast.success('Catégorie créée');
      setCategories([...categories, res.data]);
      setNewCategory({ name: '', description: '' });
      setShowNewCategoryForm(false);
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-body min-h-screen pb-24 md:pb-0" style={{ backgroundColor: '#f8faf9' }}>
      <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline/50">
        <div className="flex justify-between items-center px-6 md:px-12 h-16 max-w-screen-2xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 hover:opacity-70 transition">
              <span className="material-symbols-outlined text-primary" style={{ color: '#064c36' }}>arrow_back</span>
              <h1 className="text-lg font-bold text-primary uppercase" style={{ color: '#064c36' }}>Gestion Catalogue</h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto">
          {/* TABS */}
          <div className="flex gap-4 mb-8 border-b border-outline">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-bold border-b-2 transition ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
              style={{
                borderColor: activeTab === 'products' ? '#064c36' : 'transparent',
                color: activeTab === 'products' ? '#064c36' : '#5c625e'
              }}
            >
              Produits ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 font-bold border-b-2 transition ${
                activeTab === 'categories'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
              style={{
                borderColor: activeTab === 'categories' ? '#064c36' : 'transparent',
                color: activeTab === 'categories' ? '#064c36' : '#5c625e'
              }}
            >
              Catégories ({categories.length})
            </button>
          </div>

          {/* PRODUITS */}
          {activeTab === 'products' && (
            <>
              <div className="mb-8">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-outline rounded-xl py-3 pl-12 pr-4"
                    placeholder="Rechercher un produit..."
                    type="text"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-primary">Chargement...</div>
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden border border-outline">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-surface-variant/50 border-b border-outline">
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-on-surface-variant">Produit</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-on-surface-variant">Catégorie</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-on-surface-variant">Prix</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-on-surface-variant">Stock</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-on-surface-variant">Boutique</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-on-surface-variant">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-surface-variant/30 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded object-cover" />
                                <p className="font-semibold text-on-surface">{product.name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-on-surface-variant">{product.category?.name || '-'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-primary">{Number(product.price).toLocaleString()} FCFA</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm">{product.stock} unités</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-on-surface-variant">{product.shop?.name || '-'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Link href={`/admin/product/${product.id}`}>
                                  <button className="px-3 py-1 text-xs font-bold bg-primary text-white rounded hover:opacity-90 transition">
                                    Voir
                                  </button>
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  disabled={actionLoading === product.id}
                                  className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CATÉGORIES */}
          {activeTab === 'categories' && (
            <>
              <div className="mb-8 flex justify-between items-center">
                <h3 className="text-lg font-bold text-on-surface">Gestion des Catégories</h3>
                <button
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition"
                  style={{ backgroundColor: '#064c36' }}
                >
                  + Nouvelle Catégorie
                </button>
              </div>

              {showNewCategoryForm && (
                <div className="bg-white border border-outline rounded-lg p-6 mb-8">
                  <h4 className="font-bold text-on-surface mb-4">Créer une nouvelle catégorie</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Nom</label>
                      <input
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full border border-outline rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        type="text"
                        placeholder="Ex: Légumes Frais"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Description</label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        className="w-full border border-outline rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Description..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowNewCategoryForm(false)}
                        className="px-6 py-2 border border-outline text-on-surface text-sm font-bold rounded-lg hover:bg-surface-variant transition"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleAddCategory}
                        disabled={actionLoading === -1}
                        className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        style={{ backgroundColor: '#064c36' }}
                      >
                        Créer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-primary">Chargement...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white border border-outline rounded-lg p-6">
                      <h4 className="font-bold text-on-surface mb-2">{category.name}</h4>
                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{category.description || 'Pas de description'}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={actionLoading === category.id}
                          className="flex-1 px-3 py-2 text-xs font-bold bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
