'use client';

import { useEffect, useState, useCallback } from 'react';
import VendorLayout from '@/components/layouts/VendorLayout';
import { adminService } from '@/services/admin.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Search, Plus, Package, Tag, Trash2, Eye, X, LayoutGrid, Boxes } from 'lucide-react';

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

function firstImage(images: any): string {
  try {
    const arr = typeof images === 'string' ? JSON.parse(images) : images;
    return arr?.[0] ? `http://localhost:8000${arr[0]}` : '';
  } catch {
    return '';
  }
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

  const lowStockCount = products.filter(p => p.stock <= 5).length;

  return (
    <VendorLayout>
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Gestion du Catalogue</h1>
            <p className="text-slate-500 text-sm mt-1">Produits et catégories de la marketplace</p>
          </div>
        </div>

        {/* Stats Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-3xl border-l-[6px] border-l-emerald-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Produits</p>
              <Package size={18} className="text-emerald-700" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{products.length}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-[6px] border-l-teal-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Catégories</p>
              <Tag size={18} className="text-teal-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{categories.length}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-[6px] border-l-amber-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Stock faible</p>
              <Boxes size={18} className="text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{lowStockCount}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-[6px] border-l-slate-400 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Boutiques actives</p>
              <LayoutGrid size={18} className="text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{new Set(products.map(p => p.shop?.name).filter(Boolean)).size}</p>
          </div>
        </section>

        {/* Card principale */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-emerald-900/10 shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex gap-1 p-2 m-4 mb-0 bg-emerald-50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'products' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <Package size={15} /> Produits ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'categories' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <Tag size={15} /> Catégories ({categories.length})
            </button>
          </div>

          {/* PRODUITS */}
          {activeTab === 'products' && (
            <div className="p-4 md:p-6">
              <div className="relative mb-5">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  placeholder="Rechercher un produit..."
                  type="text"
                />
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Aucun produit trouvé</p>
                </div>
              ) : (
                <>
                  {/* Table desktop */}
                  <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-emerald-50/60">
                          <th className="px-5 py-3.5 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Produit</th>
                          <th className="px-5 py-3.5 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Catégorie</th>
                          <th className="px-5 py-3.5 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Prix</th>
                          <th className="px-5 py-3.5 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Stock</th>
                          <th className="px-5 py-3.5 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Boutique</th>
                          <th className="px-5 py-3.5 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-50 flex-shrink-0">
                                  {firstImage(product.images) ? (
                                    <img src={firstImage(product.images)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-emerald-300" /></div>
                                  )}
                                </div>
                                <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{product.category?.name || '—'}</span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-emerald-700 text-sm">{Number(product.price).toLocaleString('fr-FR')} FCFA</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${product.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {product.stock} unités
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-500">{product.shop?.name || '—'}</p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-2">
                                <Link href={`/admin/product/${product.id}`}
                                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1.5">
                                  <Eye size={12} /> Voir
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  disabled={actionLoading === product.id}
                                  className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  <Trash2 size={12} /> {actionLoading === product.id ? '...' : 'Suppr.'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards mobile */}
                  <div className="md:hidden space-y-3">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-50 flex-shrink-0">
                            {firstImage(product.images) ? (
                              <img src={firstImage(product.images)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-emerald-300" /></div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 text-sm truncate">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.category?.name || '—'} · {product.shop?.name || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-bold text-emerald-700 text-sm">{Number(product.price).toLocaleString('fr-FR')} FCFA</p>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${product.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {product.stock} unités
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/product/${product.id}`}
                            className="flex-1 text-center px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">
                            Voir
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={actionLoading === product.id}
                            className="flex-1 px-3 py-2 text-xs font-bold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            {actionLoading === product.id ? '...' : 'Supprimer'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CATÉGORIES */}
          {activeTab === 'categories' && (
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-slate-800">Gestion des Catégories</h3>
                <button
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="px-5 py-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {showNewCategoryForm ? <X size={15} /> : <Plus size={15} />}
                  {showNewCategoryForm ? 'Fermer' : 'Nouvelle catégorie'}
                </button>
              </div>

              {showNewCategoryForm && (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 mb-6 space-y-4 animate-[fadeIn_0.25s_ease-in]">
                  <h4 className="font-bold text-slate-800 text-sm">Créer une nouvelle catégorie</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Nom</label>
                    <input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full bg-white border-2 border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      type="text"
                      placeholder="Ex: Légumes Frais"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Description</label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full bg-white border-2 border-transparent rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      placeholder="Description..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowNewCategoryForm(false)}
                      className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddCategory}
                      disabled={actionLoading === -1}
                      className="px-5 py-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {actionLoading === -1 ? 'Création...' : 'Créer'}
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-16">
                  <Tag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Aucune catégorie pour l'instant</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category, idx) => {
                    const productCount = products.filter(p => p.category?.name === category.name).length;
                    const palette = [
                      { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'hover:ring-emerald-200', bar: 'bg-emerald-500' },
                      { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'hover:ring-teal-200', bar: 'bg-teal-500' },
                      { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'hover:ring-amber-200', bar: 'bg-amber-500' },
                      { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'hover:ring-blue-200', bar: 'bg-blue-500' },
                      { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'hover:ring-purple-200', bar: 'bg-purple-500' },
                    ];
                    const c = palette[idx % palette.length];
                    return (
                      <div key={category.id}
                        className={`relative bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 ${c.ring} transition-all duration-300 group overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-full h-1 ${c.bar}`} />
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Tag size={18} className={c.text} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
                            {productCount} produit{productCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1.5 leading-snug">{category.name}</h4>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2 min-h-[32px]">{category.description || 'Pas de description'}</p>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={actionLoading === category.id}
                          className="w-full px-3 py-2.5 text-xs font-bold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={12} /> {actionLoading === category.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
