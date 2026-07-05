/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ShoppingBag,
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

const parseImages = (images: unknown): string[] => {
  if (Array.isArray(images)) return images.filter(Boolean).map(String);
  if (typeof images !== "string" || images.trim() === "") return [];

  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    if (typeof parsed === "string" && parsed.trim() !== "") return [parsed];
  } catch {
    return [images];
  }

  return [];
};

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
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number | null;
  }>({ min: 0, max: null });
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
          price: Number(p.price) || 0,
          images: parseImages(p.images),
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
    .filter((p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    )
    .filter(
      (p) =>
        p.price >= priceRange.min &&
        (priceRange.max === null || p.price <= priceRange.max),
    )
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-emerald-700">Chargement du marché...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-8">
      {/* HEADER - Professionnel et responsive */}
      <header className="sticky top-16 z-30 rounded-2xl border border-[#c2c9bb]/35 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#154212] shadow-sm">
                <Sprout className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-xl text-[#191c18]">
                  Marketplace
                </h1>
                <p className="-mt-1 text-xs font-semibold text-[#154212]">
                  Intelligent Growth
                </p>
              </div>
            </div>
            <div className="relative order-3 w-full min-w-0 sm:order-none sm:flex-1 sm:max-w-md lg:max-w-lg">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#72796e]" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#f9faf2]/80 pl-11 pr-4 text-sm text-[#191c18] transition placeholder:text-[#72796e] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#bcf0ae]"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/orders"
                className="rounded-xl border border-[#c2c9bb]/45 bg-white/80 p-2 transition hover:bg-[#eaf3de]"
              >
                <ShoppingCart className="h-5 w-5 text-[#42493e]" />
              </Link>
              <button className="rounded-xl border border-[#c2c9bb]/45 bg-white/80 p-2 transition hover:bg-[#eaf3de]">
                <Bell className="h-5 w-5 text-[#42493e]" />
              </button>
              <Link
                href="/add-product"
                className="hidden items-center gap-1 rounded-xl bg-[#154212] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5a27] sm:flex"
              >
                <Plus className="w-4 h-4" />
                Ajouter un produit
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-4 sm:py-6">
        {/* FILTRES - Design épuré */}
        <div className="mb-6 flex flex-col gap-3 border-b border-[#c2c9bb]/35 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 overflow-x-auto pb-1 hide-scrollbar">
            <span className="whitespace-nowrap rounded-full bg-[#eaf3de] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#154212]">
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
          <div className="flex w-full gap-2 sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 min-w-0 flex-1 rounded-lg border border-emerald-100 bg-white px-3 text-xs font-medium focus:ring-2 focus:ring-emerald-400 sm:flex-none"
            >
              <option value="date_desc">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="flex h-9 items-center gap-1 rounded-lg border border-emerald-100 bg-white px-3 text-xs font-medium transition hover:bg-emerald-50"
            >
              <Filter className="w-4 h-4" /> Prix
            </button>
          </div>
        </div>

        {/* FILTRE PRIX (déroulant) */}
        {showPriceFilter && (
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-emerald-100 bg-white/80 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
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
                value={priceRange.max ?? ""}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    max: e.target.value === "" ? null : +e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-emerald-100 text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        )}

        {/* SECTION HERO - Modernisée */}
        <section className="relative mb-10 h-[300px] overflow-hidden rounded-2xl sm:mb-12 sm:h-[380px]">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=90&w=2000&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="relative flex h-full items-center px-5 sm:px-10">
            <div className="max-w-lg text-white">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs tracking-wider font-semibold mb-4">
                SPRING COLLECTION 2026
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-6xl">
                Harvest <br />
                <span className="text-emerald-300">Excellence.</span>
              </h1>
              <p className="mt-4 text-white/80 text-sm sm:text-base">
                Produits certifiés pour une agriculture moderne et rentable.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-800 shadow-md transition hover:bg-emerald-50 sm:px-6">
                  Explorer
                </button>
                <button className="rounded-full border border-white/40 px-5 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-white/10 sm:px-6">
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
            className="flex gap-4 overflow-x-auto scroll-smooth pb-3 custom-scrollbar snap-x sm:gap-5"
          >
            {trendingItems.length === 0 ? (
              <div className="flex items-center justify-center w-full h-48 bg-white/50 rounded-xl border border-dashed">
                Aucun produit en tendance
              </div>
            ) : (
              trendingItems.map((product) => (
                <div
                  key={product.id}
                  className="group relative w-[82vw] max-w-72 flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl sm:w-72"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
