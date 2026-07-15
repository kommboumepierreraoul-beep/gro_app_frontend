/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Filter,
  Heart,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sprout,
  Star,
  Store,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import api from "@/lib/axios";

const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return "/placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;

  const clean = imagePath.replace(/^\/+/, "");
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
    const handler = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(handler);
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

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#eaf3de] text-[#154212]">
        <Package className="h-10 w-10 opacity-70" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
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
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number | null;
  }>({ min: 0, max: null });
  const [compactGrid, setCompactGrid] = useState(false);

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

  const categoriesList = ["Toutes", ...categories.map((c) => c.name)];
  const activeCategoryName =
    selectedCategory === null
      ? "Toutes les catégories"
      : categories.find((category) => category.id === selectedCategory)?.name ||
        "Catégorie";

  const addToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
    });
    toast.success(`${product.name} ajouté au panier`);
    router.push("/orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-8">
        <div className="sticky top-16 z-30 rounded-2xl border border-[#c2c9bb]/35 bg-white/92 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-[#e7e9e1]" />
              <div>
                <div className="h-3 w-24 animate-pulse rounded bg-[#e7e9e1]" />
                <div className="mt-2 h-5 w-32 animate-pulse rounded bg-[#dce2d8]" />
              </div>
            </div>
            <div className="order-3 h-11 w-full animate-pulse rounded-xl bg-[#e7e9e1] lg:order-none lg:max-w-xl lg:flex-1" />
            <div className="flex gap-2">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-[#e7e9e1]" />
              <div className="h-11 w-11 animate-pulse rounded-xl bg-[#e7e9e1]" />
              <div className="hidden h-11 w-24 animate-pulse rounded-xl bg-[#dce2d8] sm:block" />
            </div>
          </div>
        </div>

        <main className="py-4 sm:py-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#c2c9bb]/35 bg-white/85 p-4 shadow-sm"
              >
                <div className="h-5 w-5 animate-pulse rounded bg-[#e7e9e1]" />
                <div className="mt-3 h-7 w-20 animate-pulse rounded bg-[#dce2d8]" />
                <div className="mt-2 h-3 w-28 animate-pulse rounded bg-[#e7e9e1]" />
              </div>
            ))}
          </div>

          <div className="mb-5 rounded-2xl border border-[#c2c9bb]/35 bg-white/88 p-3 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-8 w-24 animate-pulse rounded-full bg-[#e7e9e1]"
                />
              ))}
            </div>
          </div>

          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="h-3 w-36 animate-pulse rounded bg-[#e7e9e1]" />
              <div className="mt-2 h-8 w-56 animate-pulse rounded bg-[#dce2d8]" />
            </div>
            <div className="h-10 w-28 animate-pulse rounded-xl bg-[#e7e9e1]" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-[#c2c9bb]/30 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-[#e7e9e1]" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-[#dce2d8]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#e7e9e1]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#e7e9e1]" />
                  <div className="flex items-end justify-between pt-2">
                    <div className="h-6 w-28 animate-pulse rounded bg-[#dce2d8]" />
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-[#dce2d8]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-8">
      <header className="sticky top-16 z-30 rounded-2xl border border-[#c2c9bb]/35 bg-white/92 shadow-sm backdrop-blur-xl">
        <div className="px-3 py-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#154212] text-white shadow-sm">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#72796e]">
                  Marketplace
                </p>
                <h1 className="text-xl font-black text-[#191c18]">Catalogue</h1>
              </div>
            </div>

            <div className="relative order-3 w-full min-w-0 lg:order-none lg:max-w-xl lg:flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72796e]" />
              <input
                type="text"
                placeholder="Rechercher un produit, une boutique..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#f9faf2]/80 pl-11 pr-4 text-sm text-[#191c18] transition placeholder:text-[#72796e] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#bcf0ae]"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/orders"
                className="rounded-xl border border-[#c2c9bb]/45 bg-white p-2.5 transition hover:bg-[#eaf3de]"
                aria-label="Commandes"
              >
                <ShoppingCart className="h-5 w-5 text-[#42493e]" />
              </Link>
              <Link
                href="/notifications"
                className="rounded-xl border border-[#c2c9bb]/45 bg-white p-2.5 transition hover:bg-[#eaf3de]"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-[#42493e]" />
              </Link>
              <Link
                href="/add-product"
                className="hidden items-center gap-2 rounded-xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d5a27] sm:flex"
              >
                <Plus className="h-4 w-4" />
                Vendre
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="py-4 sm:py-5">
        <section className="mb-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#c2c9bb]/35 bg-white/85 p-4 shadow-sm">
            <Package className="h-5 w-5 text-[#154212]" />
            <p className="mt-3 text-2xl font-black text-[#191c18]">
              {filteredProducts.length}
            </p>
            <p className="text-xs font-semibold text-[#72796e]">
              produits affichés
            </p>
          </div>
          <div className="rounded-2xl border border-[#c2c9bb]/35 bg-white/85 p-4 shadow-sm">
            <Store className="h-5 w-5 text-amber-700" />
            <p className="mt-3 text-2xl font-black text-[#191c18]">
              {categories.length}
            </p>
            <p className="text-xs font-semibold text-[#72796e]">
              catégories disponibles
            </p>
          </div>
          <div className="rounded-2xl border border-[#c2c9bb]/35 bg-white/85 p-4 shadow-sm">
            <BadgeCheck className="h-5 w-5 text-blue-700" />
            <p className="mt-3 text-2xl font-black text-[#191c18]">
              Paiement
            </p>
            <p className="text-xs font-semibold text-[#72796e]">
              suivi wallet et commandes
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-2xl border border-[#c2c9bb]/25 bg-white/70 p-2.5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#72796e]" />
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#72796e]">
                  Filtres
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {categoriesList.map((cat, idx) => {
                  const active =
                    (idx === 0 && selectedCategory === null) ||
                    (idx > 0 && selectedCategory === categories[idx - 1].id);

                  return (
                    <button
                      key={cat}
                      onClick={() =>
                        setSelectedCategory(
                          idx === 0 ? null : categories[idx - 1].id,
                        )
                      }
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                        active
                          ? "bg-[#154212] text-white shadow-sm"
                          : "border border-[#c2c9bb]/25 bg-white/60 text-[#72796e] hover:bg-[#eaf3de] hover:text-[#154212]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 xl:w-[500px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 rounded-xl border border-[#c2c9bb]/30 bg-white/70 px-3 text-xs font-bold text-[#72796e] outline-none focus:ring-2 focus:ring-[#bcf0ae]"
              >
                <option value="date_desc">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: +e.target.value })
                }
                className="h-9 rounded-xl border border-[#c2c9bb]/30 bg-white/70 px-3 text-xs font-bold text-[#72796e] outline-none focus:ring-2 focus:ring-[#bcf0ae]"
                placeholder="Prix min"
                aria-label="Prix minimum"
              />
              <input
                type="number"
                value={priceRange.max ?? ""}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    max: e.target.value === "" ? null : +e.target.value,
                  })
                }
                className="h-9 rounded-xl border border-[#c2c9bb]/30 bg-white/70 px-3 text-xs font-bold text-[#72796e] outline-none focus:ring-2 focus:ring-[#bcf0ae]"
                placeholder="Prix max"
                aria-label="Prix maximum"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#3b6934]">
                {activeCategoryName}
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#191c18] sm:text-3xl">
                Produits disponibles
              </h2>
            </div>
            <button
              onClick={() => setCompactGrid((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#c2c9bb]/45 bg-white px-4 py-2.5 text-xs font-bold text-[#42493e] transition hover:bg-[#eaf3de] hover:text-[#154212]"
            >
              <Filter className="h-4 w-4" />
              {compactGrid ? "Vue confortable" : "Vue compacte"}
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c2c9bb]/60 bg-white/70 py-16 text-center">
              <Package className="mx-auto h-10 w-10 text-[#c2c9bb]" />
              <p className="mt-3 text-sm font-bold text-[#42493e]">
                Aucun produit trouvé
              </p>
              <p className="mt-1 text-xs text-[#72796e]">
                Essayez une autre recherche ou retirez un filtre.
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                compactGrid
                  ? "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
                  : "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              }`}
            >
              {filteredProducts.map((product) => {
                const image = getImageUrl(product.images?.[0]);

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-[#c2c9bb]/30 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#154212]/20 hover:shadow-xl hover:shadow-[#154212]/8"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/marketplace/products/${product.id}`)
                      }
                      className="block w-full text-left"
                    >
                      <div
                        className={`relative overflow-hidden bg-[#f3f4ed] ${
                          compactGrid ? "aspect-[5/3]" : "aspect-[4/3]"
                        }`}
                      >
                        <ProductImage src={image} alt={product.name} />
                        <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-black text-[#154212] shadow-sm">
                          {product.category?.name || "Produit"}
                        </div>
                      </div>
                    </button>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-base font-black text-[#191c18]">
                            {product.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#72796e]">
                            {product.description || "Description à venir"}
                          </p>
                        </div>
                        <button
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f9faf2] text-[#154212] transition hover:bg-[#eaf3de]"
                          aria-label="Favori"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        4.8
                        <span className="mx-1 h-1 w-1 rounded-full bg-[#c2c9bb]" />
                        <ShoppingBag className="h-3 w-3 text-[#72796e]" />
                        <span className="text-[#72796e]">
                          {product.shop?.name || "Boutique"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-[#154212]">
                            {product.price.toLocaleString()} FCFA
                          </p>
                          <Link
                            href={`/marketplace/products/${product.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#42493e] transition hover:text-[#154212]"
                          >
                            Voir produit
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#154212] text-white shadow-sm transition hover:bg-[#2d5a27]"
                          aria-label="Ajouter au panier"
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
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
