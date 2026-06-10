'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  description: string;
  created_at: string;
  category?: Category | null;
  shop?: { id: number; name: string; slug?: string } | null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function MarketplacePage() {
  const router = useRouter();
  
   const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date_desc' | 'price_asc' | 'price_desc'>('date_desc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    Promise.all([
      api
        .get('/marketplace/products')
        .then((res) => {
          // Extraction robuste du tableau
          let data = res.data;
          if (data.data?.data) data = data.data.data;
          else if (data.data) data = data.data;
          return Array.isArray(data) ? data : [];
        })
        .catch(() => []),
      api
        .get('/categories')
        .then((res) => {
          let data = res.data;
          if (data.data) data = data.data;
          return Array.isArray(data) ? data : [];
        })
        .catch(() => []),
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
    }).finally(() => setLoading(false));
  }, []);

  const filteredProducts = products
    .filter((p) => selectedCategory === null || p.category?.id === selectedCategory)
    .filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const trendingItems = filteredProducts.slice(0, 5);
  const trendingRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
const scrollCategories = (direction: 'left' | 'right') => {
  if (categoriesRef.current) {
    categoriesRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  }
};
  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingRef.current) {
      trendingRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const addToCart = (product: Product) => {
  addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0],
  });
  toast.success(`${product.name} ajouté au panier !`);
  router.push('/orders');
};
  const categoriesList = ['All Categories', ...categories.map((c) => c.name)];

  return (
    <div className="min-h-screen bg-[#E8F5EC]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#E8F5EC]/90 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0C7A43] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white">agriculture</span>
              </div>
              <div>
                <h1 className="font-black text-2xl text-[#0C2C22]">Intelligent</h1>
                <p className="text-sm text-[#5A786C]">Growth</p>
              </div>
            </div>
            <div className="relative flex-1 max-w-md lg:max-w-[520px]">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#6D8A7F]">search</span>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-14 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md outline-none focus:ring-2 focus:ring-[#0C7A43] transition"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-white/80 shadow flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
              <button className="w-12 h-12 rounded-2xl bg-white/80 shadow flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link
                href="/add-product"
                className="px-5 h-12 rounded-2xl bg-[#0C7A43] text-white flex items-center font-bold shadow-md hover:shadow-lg transition"
              >
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pb-32">
        {/* FILTRES – Design moderne avec flèches */}
<div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-[#D4E6D9] mb-4">
  <div className="flex items-center gap-4 w-full lg:w-auto">
    <span className="text-sm font-bold uppercase tracking-wider text-[#0C7A43] bg-white/60 px-3 py-1 rounded-full whitespace-nowrap">
      Catégories
    </span>
    <div className="relative flex items-center gap-2 max-w-[calc(100%-120px)] lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
      <button
        onClick={() => scrollCategories('left')}
        className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#0C7A43] hover:bg-[#0C7A43] hover:text-white transition disabled:opacity-50"
        style={{ transform: 'translateX(-50%)' }}
      >
        <span className="material-symbols-outlined text-base">chevron_left</span>
      </button>
      <div
        ref={categoriesRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 hide-scrollbar px-6"
      >
        {categoriesList.map((cat, idx) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(idx === 0 ? null : categories[idx - 1].id)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              (idx === 0 && selectedCategory === null) ||
              (idx > 0 && selectedCategory === categories[idx - 1].id)
                ? 'bg-[#0C7A43] text-white shadow-md ring-1 ring-[#0C7A43]/30'
                : 'bg-white/80 border border-[#CBE0D2] text-[#2B5E48] hover:bg-[#F0F9F3] hover:border-[#0C7A43]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <button
        onClick={() => scrollCategories('right')}
        className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#0C7A43] hover:bg-[#0C7A43] hover:text-white transition"
        style={{ transform: 'translateX(50%)' }}
      >
        <span className="material-symbols-outlined text-base">chevron_right</span>
      </button>
    </div>
  </div>
  <div className="flex gap-3 items-center">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as any)}
      className="h-10 px-4 rounded-xl border border-[#D4E6D9] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0C7A43]/30"
    >
      <option value="date_desc">Plus récents</option>
      <option value="price_asc">Prix croissant</option>
      <option value="price_desc">Prix décroissant</option>
    </select>
    <button
      onClick={() => setShowPriceFilter(!showPriceFilter)}
      className="h-10 px-4 rounded-xl border border-[#D4E6D9] bg-white text-sm font-medium flex items-center gap-2 hover:bg-[#F0F9F3] transition"
    >
      <span className="material-symbols-outlined text-[18px]">filter_alt</span> Prix
    </button>
  </div>
</div>
        {showPriceFilter && (
          <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#D4E6D9] flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Min (FCFA)</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, min: +e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Max (FCFA)</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, max: +e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              />
            </div>
          </div>
        )}

        {/* HERO */}
       <section className="relative overflow-hidden rounded-[36px] h-[420px] mt-4 mb-10">
  {/* Image (plus discrète) */}
  <img
    src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=90&w=2000&auto=format&fit=crop"
    className="absolute inset-0 w-full h-full object-cover brightness-90"
    loading="lazy"
  />
  {/* Overlay sombre pour renforcer le contraste du texte */}
  <div className="absolute inset-0 bg-black/50" />
  {/* Dégradé léger sur les côtés pour une transition douce */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
  <div className="relative h-full flex items-center">
    <div className="pl-12 max-w-xl">
      <div className="inline-flex px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-xs tracking-wider font-bold mb-6">
        SPRING COLLECTION 2026
      </div>
      <h1 className="text-white font-black text-7xl leading-[72px]">
        Harvest<br />
        <span className="text-[#65F4A9]">Excellence.</span>
      </h1>
      <p className="mt-6 text-white/90 text-lg leading-8">
        Upgrade your yield with premium certified products designed for modern agriculture.
      </p>
      <div className="flex gap-4 mt-8">
        <button className="px-8 h-14 bg-white rounded-2xl font-bold text-[#0C7A43]">
          Explore Catalog
        </button>
        <button className="px-8 h-14 border border-white/40 text-white rounded-2xl backdrop-blur">
          Details
        </button>
      </div>
    </div>
  </div>
</section>

        {/* TRENDING NOW */}
        <section className="bg-[#DDF0E4] border border-[#CBE5D4] rounded-[36px] p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="uppercase tracking-[3px] text-[10px] font-black text-[#0C7A43]">CURATION</p>
              <h2 className="text-4xl font-black text-[#0C2C22] mt-2">Trending Now</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => scrollTrending('left')}
                className="w-11 h-11 rounded-full border border-[#BFDCCB] flex items-center justify-center text-[#0C7A43] bg-white/60 hover:bg-white transition"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => scrollTrending('right')}
                className="w-11 h-11 rounded-full border border-[#BFDCCB] flex items-center justify-center text-[#0C7A43] bg-white/60 hover:bg-white transition"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div ref={trendingRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-2 custom-scrollbar">
            {trendingItems.map((product) => (
              <div key={product.id} className="group cursor-pointer min-w-[260px]">
                <div className="overflow-hidden rounded-[24px] h-[260px] shadow-lg">
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.png')}
                  />
                </div>
                <div className="mt-4">       
                  <h3 className="font-black text-lg text-[#0C2C22]">{product.name}</h3>
                  <p className="text-[#6C8076] text-sm mt-1">{product.price} FCFA </p>
                </div>
              </div> 
            ))}
          </div>    
        </section>

        {/* POPULAR PRODUCTS */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="uppercase tracking-[3px] text-[10px] font-black text-[#0C7A43]">FARMER'S CHOICE</p>
              <h2 className="text-5xl font-black text-[#0C2C22] mt-2">Popular Products</h2>
            </div>
            <button className="h-12 px-7 rounded-full bg-white border border-[#D7E7DB] font-bold text-[#0C7A43] flex items-center gap-2">
              VIEW ALL <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return (
                <div
  key={product.id}
  className="bg-white rounded-[28px] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
>
  <div className="relative">
    <div className="absolute top-3 left-3 z-20">
      <span className="bg-[#0C8A4B] text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider">
        {product.category?.name || 'BIO'}
      </span>
    </div>

    {isNew && (
      <div className="absolute top-3 right-14 z-20">
        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-md" />
      </div>
    )}

    <button className="absolute right-3 top-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md">
      <span className="material-symbols-outlined text-[#0C8A4B] text-[18px]">
        favorite
      </span>
    </button>

    <div className="h-[200px] rounded-[22px] overflow-hidden bg-[#F4F7F5]">
      <img
        src={product.images?.[0] || '/placeholder.png'}
        alt={product.name}
        className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
        loading="lazy"
        onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.png')}
      />
    </div>
  </div>

  <div className="mt-4">
    <h3 className="text-[19px] font-black leading-tight text-[#0C2C22]">
      {product.name}
    </h3>

    <p className="text-[#75877D] mt-2 text-sm leading-6 h-[44px] overflow-hidden">
      {product.description?.substring(0, 70) || 'Premium Product'}
    </p>

    <div className="mt-4 flex items-end justify-between gap-3">
      <div>
        <div className="text-[24px] font-black text-[#0C2C22] leading-none">
          {Number(product.price).toFixed(2)} FCFA
        </div>
        <Link
          href={`/marketplace/products/${product.id}`}
          className="text-sm text-[#0C7A43] font-medium hover:underline mt-1 inline-block"
        >
          View Product
        </Link>
      </div>

      <button
        onClick={() => addToCart(product)}
        className="w-14 h-14 rounded-[18px] bg-[#007E49] text-white flex items-center justify-center shadow-[0_12px_25px_rgba(0,126,73,0.25)] hover:scale-105 transition-all"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
      </button>
    </div>
  </div>
</div>
              );
            })}
          </div>
        </section>
      </main>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-16 bg-[#355D4C] px-12 py-5 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.18)]">
        <button className="flex flex-col items-center text-[#6BFFB0]">
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[10px] font-bold mt-1">MARKET</span>
        </button>
        <button className="flex flex-col items-center text-white/70">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] font-bold mt-1">EXPLORE</span>
        </button>
        <button className="flex flex-col items-center text-white/70">
          <span className="material-symbols-outlined">agriculture</span>
          <span className="text-[10px] font-bold mt-1">MY FARM</span>
        </button>
        <button className="flex flex-col items-center text-white/70">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold mt-1">PROFILE</span>
        </button>
      </div>

      
    </div>
  );
}