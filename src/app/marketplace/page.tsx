"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Bell,
  Plus,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Package,
  ArrowRight,
  Heart,
  Store,
  ShoppingBag,
  User,
  Sprout,
  SlidersHorizontal,
  Filter,
} from "lucide-react";

// ✅ CORRECTION : Utiliser l'IP au lieu de localhost
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return "/placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;

  const clean = imagePath.replace(/^\/+/, "");
  // ✅ Utilise la même base que votre API
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://10.0.0.118:8000";
  return `${baseUrl}/${clean}`;
};

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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<
    "date_desc" | "price_asc" | "price_desc"
  >("date_desc");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/marketplace/products"),
          api.get("/categories"),
        ]);

        const parseResponse = (data: any) => {
          if (typeof data === "string") {
            const cleaned = data.replace(/^[^\{\[]+/, "");
            return JSON.parse(cleaned);
          }
          return data;
        };

        let productsData = parseResponse(productsRes.data);
        let categoriesData = parseResponse(categoriesRes.data);

        if (productsData?.data?.data) {
          productsData = productsData.data.data;
        } else if (productsData?.data && Array.isArray(productsData.data)) {
          productsData = productsData.data;
        } else if (!Array.isArray(productsData)) {
          productsData = [];
        }

        if (categoriesData?.data && Array.isArray(categoriesData.data)) {
          categoriesData = categoriesData.data;
        } else if (!Array.isArray(categoriesData)) {
          categoriesData = [];
        }

        const parsedProducts = (
          Array.isArray(productsData) ? productsData : []
        ).map((p: any) => ({
          ...p,
          images:
            typeof p.images === "string"
              ? JSON.parse(p.images)
              : p.images || [],
        }));
        setProducts(parsedProducts);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err: any) {
        console.error("Erreur chargement marketplace:", err);
        toast.error("Impossible de charger les produits");
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products
    .filter(
      (p) => selectedCategory === null || p.category?.id === selectedCategory,
    )
    .filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const trendingItems = filteredProducts.slice(0, 5);
  const trendingRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const scrollTrending = (direction: "left" | "right") => {
    if (trendingRef.current) {
      trendingRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
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
    router.push("/orders");
  };

  const categoriesList = ["Toutes", ...categories.map((c) => c.name)];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8F5EC] flex items-center justify-center">
        <div className="text-emerald-700">Chargement du marché...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F5EC] pb-32">
      {/* HEADER - Professionnel et responsive */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-emerald-100/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-600 flex items-center justify-center shadow-md">
                <Sprout className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-xl text-slate-800">
                  Intelligent
                </h1>
                <p className="text-xs text-emerald-600 -mt-1">Growth</p>
              </div>
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-md lg:max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-emerald-100/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="p-2 rounded-xl bg-white/80 shadow-sm hover:shadow transition"
              >
                <ShoppingCart className="w-5 h-5 text-slate-700" />
              </Link>
              <button className="p-2 rounded-xl bg-white/80 shadow-sm hover:shadow transition">
                <Bell className="w-5 h-5 text-slate-700" />
              </button>
              <Link
                href="/add-product"
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-semibold shadow-md hover:bg-emerald-800 transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter un produit
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FILTRES - Design épuré */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 hide-scrollbar">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap">
              Catégories
            </span>
            <div className="flex gap-2">
              {categoriesList.map((cat, idx) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(
                      idx === 0 ? null : categories[idx - 1].id,
                    )
                  }
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    (idx === 0 && selectedCategory === null) ||
                    (idx > 0 && selectedCategory === categories[idx - 1].id)
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-white/80 text-slate-600 hover:bg-emerald-50 border border-emerald-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-lg border border-emerald-100 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-400"
            >
              <option value="date_desc">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="h-9 px-3 rounded-lg border border-emerald-100 bg-white text-xs font-medium flex items-center gap-1 hover:bg-emerald-50 transition"
            >
              <Filter className="w-4 h-4" /> Prix
            </button>
          </div>
        </div>

        {/* FILTRE PRIX (déroulant) */}
        {showPriceFilter && (
          <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100 flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Min (FCFA)
              </label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: +e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-emerald-100 text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Max (FCFA)
              </label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: +e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-emerald-100 text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        )}

        {/* SECTION HERO - Modernisée */}
        <section className="relative overflow-hidden rounded-2xl h-72 sm:h-[380px] mb-12">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=90&w=2000&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="relative h-full flex items-center px-6 sm:px-10">
            <div className="max-w-lg text-white">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs tracking-wider font-semibold mb-4">
                SPRING COLLECTION 2026
              </div>
              <h1 className="text-4xl sm:text-6xl font-black leading-tight">
                Harvest <br />
                <span className="text-emerald-300">Excellence.</span>
              </h1>
              <p className="mt-4 text-white/80 text-sm sm:text-base">
                Produits certifiés pour une agriculture moderne et rentable.
              </p>
              <div className="flex gap-3 mt-6">
                <button className="px-6 py-2 bg-white text-emerald-800 rounded-full font-semibold text-sm shadow-md hover:bg-emerald-50 transition">
                  Explorer
                </button>
                <button className="px-6 py-2 border border-white/40 text-white rounded-full text-sm backdrop-blur-sm hover:bg-white/10 transition">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION TRENDING NOW - Version professionnelle améliorée */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  Ne manquez pas
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                Tendances du moment
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Les produits les plus populaires cette semaine
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollTrending("left")}
                className="w-9 h-9 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 hover:bg-emerald-700 hover:text-white transition shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTrending("right")}
                className="w-9 h-9 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 hover:bg-emerald-700 hover:text-white transition shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={trendingRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-3 custom-scrollbar snap-x"
          >
            {trendingItems.length === 0 ? (
              <div className="flex items-center justify-center w-full h-48 bg-white/50 rounded-xl border border-dashed">
                Aucun produit en tendance
              </div>
            ) : (
              trendingItems.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex-shrink-0 w-64 sm:w-72 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer snap-start"
                  onClick={() =>
                    router.push(`/marketplace/products/${product.id}`)
                  }
                >
                  <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Flame className="w-3 h-3" /> Tendance
                  </div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-800 line-clamp-1 flex-1">
                        {product.name}
                      </h3>
                      <div className="bg-emerald-50 rounded-full px-2 py-0.5">
                        <span className="text-emerald-700 font-extrabold text-sm">
                          {product.price.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <ShoppingBag className="w-3 h-3" />
                      <span>{Math.floor(Math.random() * 200) + 20} ventes</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />{" "}
                        {Math.round(4 + Math.random() * 1)}.0
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          {trendingItems.length > 3 && (
            <div className="flex justify-center gap-2 mt-5 md:hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-600/70"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-200"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-200"></div>
            </div>
          )}
        </section>

        {/* SECTION POPULAR PRODUCTS - Design amélioré mais gardant la structure */}
        <section>
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-6 h-6 text-emerald-600" />
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  Le choix des agriculteurs
                </p>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-800">
                Produits populaires
              </h2>
            </div>
            <button className="h-10 px-5 rounded-full bg-white border border-emerald-200 font-bold text-emerald-700 text-sm flex items-center gap-1 hover:bg-emerald-50 transition">
              Voir tout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isNew =
                new Date(product.created_at) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group"
                >
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {product.category?.name || "BIO"}
                    </div>
                    {isNew && (
                      <div className="absolute top-2 right-12 z-10">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      </div>
                    )}
                    <button className="absolute right-2 top-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition">
                      <Heart className="w-4 h-4 text-emerald-600" />
                    </button>
                    <div className="h-48 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-bold text-slate-800 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                      {product.description?.substring(0, 70) ||
                        "Description à venir"}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <div className="text-lg font-black text-slate-800">
                          {product.price.toLocaleString()} FCFA
                        </div>
                        <Link
                          href={`/marketplace/products/${product.id}`}
                          className="text-xs text-emerald-600 font-medium hover:underline"
                        >
                          Voir produit
                        </Link>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700 transition hover:scale-105"
                      >
                        <ShoppingCart className="w-5 h-5" />
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
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 sm:gap-10 md:gap-14 bg-slate-800/90 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-white/10">
        <Link
          href="/marketplace"
          className="flex flex-col items-center text-emerald-400"
        >
          <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5">
            Market
          </span>
        </Link>
        <Link
          href="/my-shop"
          className="flex flex-col items-center text-white/70 hover:text-emerald-300 transition"
        >
          <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5">
            Ma boutique
          </span>
        </Link>
        <Link
          href="/orders"
          className="flex flex-col items-center text-white/70 hover:text-emerald-300 transition"
        >
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5">
            Commandes
          </span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center text-white/70 hover:text-emerald-300 transition"
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5">
            Profil
          </span>
        </Link>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #bbcabf;
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
