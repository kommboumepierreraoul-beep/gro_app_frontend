/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Grid3x3,
  LayoutList,
  Store,
  AlertCircle,
  Star,
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: string;
  approval_status?: "pending" | "approved" | "rejected";
  images: string[];
}

interface Shop {
  id: number;
  name: string;
  logo: string | null;
  banner: string | null;
  status?: string;
  rating?: number;
  reviews_count?: number;
}

function MyShopContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "outofstock"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [shopRes, productsRes] = await Promise.all([
          api.get("/my-shop/profile"),
          api.get("/my-shop/products"),
        ]);
        const parse = (d: any) => {
          if (typeof d === "string")
            return JSON.parse(d.replace(/^[^\{\[]+/, ""));
          return d;
        };
        const shopData = parse(shopRes.data)?.data ?? parse(shopRes.data);
        const productsData =
          parse(productsRes.data)?.data ?? parse(productsRes.data);
        setShop(shopData?.id ? shopData : null);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          router.push('/create-shop');
          return;
        }
        setError(err?.response?.data?.message || 'Erreur de chargement');
        toast.error('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const filtered = products.filter(
    (p) =>
      (filterStatus === "all" ||
        (filterStatus === "active" && p.status === "active") ||
        (filterStatus === "outofstock" && p.status !== "active")) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/marketplace/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produit supprimé");
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <AlertCircle className="mx-auto mb-2 text-red-500" />
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );

  if (shop && shop.status !== "active") {
    const rejected = shop.status === "rejected";
    return (
      <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-8 text-center shadow-sm">
        <Store className="mx-auto h-12 w-12 text-[#154212]" />
        <h1 className="mt-4 text-2xl font-black text-[#191c18]">
          {rejected ? "Boutique a corriger" : "Validation admin en attente"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-[#5a6256]">
          {rejected
            ? "Votre demande de boutique n'a pas ete approuvee. Consultez votre notification ou votre email pour connaitre les corrections demandees."
            : "Votre boutique a ete creee, mais elle doit etre validee par un administrateur avant l'ouverture de l'espace vendeur."}
        </p>
        <button
          onClick={() => router.push(rejected ? "/create-shop" : "/marketplace")}
          className="mt-5 rounded-xl bg-[#154212] px-5 py-3 text-sm font-black text-white"
        >
          {rejected ? "Corriger la demande" : "Retour marketplace"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bannière */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src={
            shop?.banner ||
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200"
          }
          className="w-full h-48 sm:h-56 object-cover"
          alt="Bannière"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                shop?.logo ||
                `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${shop?.name || "Boutique"}`
              }
              className="w-20 h-20 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
              alt="Logo"
            />
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-md">
                {shop?.name || "Ma Boutique"}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{shop?.rating || "4.9"}</span>
                  <span className="text-white/70">
                    ({shop?.reviews_count || 124} avis)
                  </span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-emerald-200">Vendeur vérifié</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/create-shop/configuration")}
              className="px-4 py-1.5 bg-black/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-black/30 transition"
            >
              Modifier
            </button>
            <button
              onClick={() => router.push("/add-product")}
              className="px-4 py-1.5 bg-emerald-600 rounded-full text-white text-sm font-medium shadow-lg hover:bg-emerald-700 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Recherche + filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "Tous" },
              { value: "active", label: "Actifs" },
              { value: "outofstock", label: "Rupture" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterStatus === status.value ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille produits */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucun produit trouvé</p>
          <button
            onClick={() => router.push("/add-product")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm inline-flex items-center gap-2 hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" /> Ajouter un produit
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-t-xl rounded-b-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1"
            >
              <div className="relative h-52 bg-slate-100 rounded-t-xl overflow-hidden">
                <img
                  src={product.images?.[0] || "/placeholder.png"}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  alt={product.name}
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${product.status === "active" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}
                  >
                    {product.status === "active" ? "Actif" : "Rupture"}
                  </span>
                  {product.approval_status === "approved" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500 text-white shadow-sm">
                      Vérifié
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={() => router.push(`/edit-product/${product.id}`)}
                    className="p-1.5 bg-white rounded-lg shadow-md hover:bg-slate-100 transition"
                  >
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                <h3 className="font-semibold text-base text-slate-800 line-clamp-1">
                  {product.name}
                </h3>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Prix
                    </p>
                    <p className="font-bold text-emerald-600 text-xl">
                      {product.price.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Stock
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {product.stock} unités
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-wrap items-center gap-4 border border-slate-100"
            >
              <img
                alt=""
                src={product.images?.[0] || "/placeholder.png"}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{product.name}</h3>
                <div className="flex gap-4 mt-1 text-sm">
                  <span className="text-emerald-600 font-bold">
                    {product.price.toLocaleString()} FCFA
                  </span>
                  <span className="text-slate-400">Stock: {product.stock}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/edit-product/${product.id}`)}
                  className="p-2 rounded-md hover:bg-slate-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-md hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MaBoutique() {
  return <MyShopContent />;
}
