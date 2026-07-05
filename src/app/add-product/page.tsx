'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ImagePlus,
  Package,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Shop {
  id: number;
  name: string;
  logo: string | null;
  total_sales?: number;
  rating?: number;
  reliability?: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock: '',
    images: [] as string[],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        const parseResponse = (data: any) => {
          if (typeof data === 'string') {
            const cleaned = data.replace(/^[^\{\[]+/, '');
            return JSON.parse(cleaned);
          }
          return data;
        };
        let data = parseResponse(res.data);
        // La réponse peut être { data: [...] } ou directement [...]
        const categoriesArray = data?.data ?? data;
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      } catch (error) {
        console.error('Erreur chargement catégories', error);
        toast.error('Impossible de charger les catégories');
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Charger les infos de la boutique (logo, nom, stats)
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await api.get('/my-shop/profile');
        const parseResponse = (data: any) => {
          if (typeof data === 'string') {
            const cleaned = data.replace(/^[^\{\[]+/, '');
            return JSON.parse(cleaned);
          }
          return data;
        };
        let shopRaw = parseResponse(res.data);
        const shopData = shopRaw?.data ?? shopRaw;
        if (shopData && shopData.id) {
          setShop({
            id: shopData.id,
            name: shopData.name,
            logo: shopData.logo,
            total_sales: shopData.total_sales || 0,
            rating: shopData.rating || 0,
            reliability: shopData.reliability || 98,
          });
        } else {
          setShop(null);
        }
      } catch (error) {
        console.error('Erreur chargement boutique', error);
        setShop(null);
      }
    };
    fetchShop();
  }, []);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setForm(prev => ({ ...prev, images: [...prev.images, ...newPreviews] }));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(form.images[index]);
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDraft = () => {
    localStorage.setItem('productDraft', JSON.stringify(form));
    toast.success('Brouillon sauvegardé');
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category_id || !form.price || !form.stock) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category_id', form.category_id);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    for (const file of imageFiles) {
      formData.append('images[]', file);
    }

    try {
      await api.post('/marketplace/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Produit publié avec succès !');
      router.push('/my-shop');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la publication');
    } finally {
      setIsLoading(false);
    }
  };

  const listingQuality = Math.min(
    100,
    (form.name ? 30 : 0) +
      (form.description && form.description.length > 50 ? 30 : form.description ? 15 : 0) +
      (form.images.length * 10) +
      (form.price && form.stock ? 10 : 0)
  );

  const getQualityLabel = () => {
    if (listingQuality >= 80) return { label: 'Excellent', color: '#10b981' };
    if (listingQuality >= 50) return { label: 'Bon', color: '#f59e0b' };
    return { label: 'À améliorer', color: '#ef4444' };
  };

  const quality = getQualityLabel();

  return (
    <div className="min-h-screen bg-transparent pb-8">
      <header className="sticky top-16 z-30 rounded-2xl border border-[#c2c9bb]/35 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c2c9bb]/45 bg-white/70 transition hover:bg-[#eaf3de]"
            >
              <ArrowLeft className="h-5 w-5 text-[#154212]" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#154212]">Seller Center</p>
              <h1 className="truncate text-lg font-black text-[#191c18] sm:text-xl">Nouveau produit</h1>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <button
              onClick={handleDraft}
              className="h-10 flex-1 rounded-xl border border-[#c2c9bb]/45 bg-white px-3 text-sm font-medium text-[#154212] transition hover:bg-[#eaf3de] sm:flex-none sm:px-5"
            >
              Sauvegarder
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-10 flex-1 rounded-xl bg-[#154212] px-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#2d5a27] disabled:opacity-60 sm:flex-none sm:px-6"
            >
              {isLoading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-4 sm:py-6">
        <div className="mb-8 gap-6 text-center md:mb-10 md:flex md:items-center md:justify-between md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800">Créer un produit</h2>
            <p className="text-emerald-600 text-sm mt-1">Remplissez les informations ci-dessous</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:mt-0 md:justify-end">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <Package className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Stock: {form.stock || 0} unités</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <ImagePlus className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">{form.images.length} image(s)</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-emerald-100/60 shadow-sm p-6 transition hover:shadow-md">
              <h3 className="text-lg font-black text-gray-800 mb-1">Informations produit</h3>
              <p className="text-sm text-gray-500 mb-6">Détails essentiels pour les acheteurs</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Ex: Engrais bio NPK 25kg"
                    className="w-full h-12 rounded-xl border border-emerald-200 bg-white/80 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setField('category_id', e.target.value)}
                      className="w-full h-12 rounded-xl border border-emerald-200 bg-white/80 px-4 focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setField('price', e.target.value)}
                      placeholder="0"
                      className="w-full h-12 rounded-xl border border-emerald-200 bg-white/80 px-4 focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Décrivez votre produit (bénéfices, usage, qualité)..."
                    className="w-full rounded-xl border border-emerald-200 bg-white/80 p-4 focus:ring-2 focus:ring-emerald-500/30 resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setField('stock', e.target.value)}
                      placeholder="0"
                      className="w-full h-12 rounded-xl border border-emerald-200 bg-white/80 px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                    <input type="text" placeholder="Optionnel" className="w-full h-12 rounded-xl border border-emerald-200 bg-white/80 px-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-emerald-100/60 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-800 mb-1">Médias</h3>
              <p className="text-sm text-gray-500 mb-6">Ajoutez des photos du produit (max 10MB chacune)</p>
              <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition bg-emerald-50/30">
                <UploadCloud className="mx-auto h-12 w-12 text-emerald-400" />
                <p className="mt-2 text-sm text-gray-500">Glissez ou cliquez pour ajouter des images</p>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mt-3 mx-auto block text-sm" />
              </div>
              {form.images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="group relative rounded-xl overflow-hidden border border-emerald-100 shadow-sm">
                      <img src={img} className="w-full h-36 object-cover group-hover:scale-105 transition duration-300" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-red-100 transition"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {shop && (
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3">
                  {shop.logo ? (
                    <img src={shop.logo} className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold">{shop.name}</h4>
                    <p className="text-emerald-200 text-xs">Vendeur vérifié</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                  <div><p className="text-emerald-300 text-xs">Ventes</p><p className="font-black">{shop.total_sales?.toLocaleString() || 0}</p></div>
                  <div><p className="text-emerald-300 text-xs">Note</p><p className="font-black">{shop.rating?.toFixed(1) || '0.0'}★</p></div>
                  <div><p className="text-emerald-300 text-xs">Confiance</p><p className="font-black">{shop.reliability || 0}%</p></div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-gray-800">Score de qualité</h3>
              </div>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={quality.color}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - listingQuality / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-800">{listingQuality}%</span>
                  <span className="text-xs text-gray-500">Qualité</span>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${quality.color}10`, color: quality.color }}>
                  {quality.label}
                </span>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><span>Nom</span><span>{form.name ? '✅' : '❌'}</span></div>
                <div className="flex justify-between"><span>Description</span><span>{form.description?.length > 50 ? '✅' : form.description ? '⚠️' : '❌'}</span></div>
                <div className="flex justify-between"><span>Images</span><span>{form.images.length > 0 ? '✅' : '❌'}</span></div>
                <div className="flex justify-between"><span>Prix / Stock</span><span>{form.price && form.stock ? '✅' : '⚠️'}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">Aperçu</h3>
              <div className="rounded-xl overflow-hidden border border-emerald-100">
                <img src={form.images[0] || 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400'} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-gray-800">{form.name || 'Nom du produit'}</h4>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{form.description || 'Description...'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-black text-emerald-700">{form.price ? `${form.price} FCFA` : '0 FCFA'}</span>
                    <span className="text-xs text-gray-400">Stock: {form.stock || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
