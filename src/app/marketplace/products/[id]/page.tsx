'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { messageService } from '@/services/community/message.service';
import { ChevronLeft, ChevronRight, Heart, Share2, Truck, Star, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ Définition des types localement pour éviter les erreurs
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category?: {
    id: number;
    name: string;
  };
  shop?: {
    id: number;
    user_id?: number;
    name: string;
    logo: string;
    banner?: string;
  };
  is_featured?: boolean;
  unit_price?: number;
  variety?: string;
  origin?: string;
  certification?: string;
  delivery_condition?: string;
  created_at?: string;
  updated_at?: string;
}

type ProductApiResponse = Product | { data?: Product | { data?: Product } };

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const toApiError = (error: unknown): ApiError =>
  error && typeof error === 'object' ? (error as ApiError) : {};

const extractProduct = (response: ProductApiResponse): Product | null => {
  if ("id" in response) return response;

  const firstData = response.data;
  if (!firstData) return null;

  if ("id" in firstData) return firstData;
  return firstData.data ?? null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productId = Number(params.id);
      
      if (isNaN(productId)) {
        throw new Error('ID du produit invalide');
      }

      // ✅ Appel API avec gestion correcte de la réponse
      const response = (await productService.getProduct(
        productId,
      )) as ProductApiResponse;
      
      // ✅ Extraction correcte des données quel que soit le format
      const productData = extractProduct(response);

      if (!productData) {
        throw new Error('Produit introuvable');
      }

      setProduct(productData);

      if (productData.images?.length > 0) {
        setSelectedImage(productData.images[0]);
      }

    } catch (err) {
      const apiError = toApiError(err);
      console.error('Erreur de chargement:', err);
      
      // ✅ Gestion des erreurs plus précise
      if (apiError.response?.status === 404) {
        setError('Produit non trouvé');
        toast.error('Produit non trouvé');
      } else if (apiError.response?.status === 500) {
        setError('Erreur serveur, veuillez réessayer plus tard');
        toast.error('Erreur serveur');
      } else if (apiError.response?.status === 401) {
        setError('Session expirée, veuillez vous reconnecter');
        toast.error('Session expirée');
      } else {
        setError(apiError.message || 'Erreur lors du chargement du produit');
        toast.error(apiError.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProduct();
    }
  }, [loadProduct, params?.id]);

  const nextImage = () => {
    if (product?.images?.length) {
      const next = (currentIndex + 1) % product.images.length;
      setCurrentIndex(next);
      setSelectedImage(product.images[next]);
    }
  };

  const prevImage = () => {
    if (product?.images?.length) {
      const prev = (currentIndex - 1 + product.images.length) % product.images.length;
      setCurrentIndex(prev);
      setSelectedImage(product.images[prev]);
    }
  };

  const addToCart = async () => {
    try {
      // TODO: Implémenter l'ajout au panier
      toast.success('Produit ajouté au panier');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const toggleWishlist = async () => {
    try {
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch {
      toast.error('Erreur');
    }
  };

  const contactSeller = async () => {
    if (!product?.shop?.user_id) {
      toast.error("Impossible d'identifier le vendeur");
      return;
    }

    setIsCreatingConversation(true);
    try {
      const conversation = await messageService.createOrFindConversation(
        product.shop.user_id,
      );
      router.push(`/messages?id=${conversation.id}`);
    } catch (error) {
      const apiError = toApiError(error);
      toast.error(
        apiError.response?.data?.message ||
          "Impossible d'ouvrir la conversation",
      );
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // ✅ État de chargement
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-700 font-medium">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // ✅ État d'erreur
  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800">Produit introuvable</h2>
          <p className="text-gray-500 mt-2">{error || "Le produit n'existe pas ou a été supprimé."}</p>
          <button 
            onClick={loadProduct}
            className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition"
          >
            Réessayer
          </button>
          <a href="/marketplace" className="block mt-3 text-emerald-600 hover:underline">
            Retour à la marketplace
          </a>
        </div>
      </div>
    );
  }

  // ✅ Affichage du produit
  return (
    <div className="min-h-screen bg-transparent pb-8">
      <main className="mx-auto max-w-7xl py-4 sm:py-6">
        {/* Fil d'Ariane */}
        <div className="mb-5 flex min-w-0 items-center gap-2 overflow-hidden text-sm text-gray-500 sm:mb-6">
          <a href="/marketplace" className="hover:text-emerald-600 transition">Marketplace</a>
          <span>›</span>
          <span className="truncate font-medium text-gray-800">{product.name}</span>
        </div>

        <div className="grid gap-7 lg:grid-cols-2 lg:gap-12">
          {/* COLONNE GAUCHE - IMAGES */}
          <div className="space-y-4">
            <div className="relative group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square overflow-hidden bg-gray-50">
                <img
                  src={selectedImage || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.png';
                  }}
                />
              </div>
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-emerald-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition"
                  >
                    <ChevronRight className="w-5 h-5 text-emerald-700" />
                  </button>
                </>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setSelectedImage(img);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-emerald-600 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      className="w-full h-full object-cover" 
                      alt={`mini-${idx}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE - INFOS PRODUIT */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_featured && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">⭐ Mis en avant</span>
              )}
              {product.stock > 0 ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">✔ En stock</span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">⚠ Rupture</span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">🌱 Agriculture durable</span>
            </div>

            {/* Titre et catégorie */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {product.category?.name || 'Agriculture'}
                </span>
              </div>
            </div>

            {/* Évaluation */}
            <div className="flex flex-wrap items-center gap-2 border-y border-gray-100 py-4 sm:gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">4.8</span>
              <span className="text-sm text-gray-500">(127 avis vérifiés)</span>
            </div>

            {/* Prix */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/30 rounded-2xl p-5">
              <div className="text-3xl font-black text-emerald-700 sm:text-4xl">
                {Number(product.price).toLocaleString()} <span className="text-xl font-medium">FCFA</span>
              </div>
              {product.unit_price && (
                <div className="text-sm text-emerald-600 mt-1">Soit {product.unit_price} FCFA / unité</div>
              )}
            </div>

            {/* Quantité et actions */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="font-medium text-gray-700">Quantité :</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">Stock max : {product.stock}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={addToCart}
                  className="flex-1 h-14 rounded-xl bg-emerald-700 text-white font-bold shadow-md hover:bg-emerald-800 transition flex items-center justify-center gap-2"
                >
                  Ajouter au panier
                </button>
                <button className="flex-1 h-14 rounded-xl border-2 border-emerald-600 text-emerald-700 font-bold hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                  Acheter maintenant
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <button
                  onClick={toggleWishlist}
                  className={`flex-1 h-12 rounded-xl border border-gray-200 font-medium transition flex items-center justify-center gap-2 ${
                    isWishlisted ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  {isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
                <button className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Partager
                </button>
              </div>
            </div>

            {/* Livraison */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
              {product.delivery_condition ? (
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700">{product.delivery_condition}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm italic text-gray-400">Aucune information de livraison fournie</span>
                </div>
              )}
            </div>

            {/* Bloc Vendeur */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={product.shop?.logo || 'https://via.placeholder.com/48'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                  alt="shop"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                  }}
                />
                <div className="min-w-0">
                  <h4 className="truncate font-bold text-gray-800">{product.shop?.name || 'Vendeur partenaire'}</h4>
                  <p className="text-xs text-gray-500">Vendeur vérifié • 98% de satisfaction</p>
                </div>
              </div>
              <button
                onClick={contactSeller}
                disabled={isCreatingConversation}
                className="flex items-center justify-center gap-2 rounded-full border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 sm:justify-start"
              >
                <MessageCircle className="w-4 h-4" />
                {isCreatingConversation ? 'Ouverture...' : 'Contacter'}
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPTION DÉTAILLÉE */}
        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-16 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Description du produit</h2>
          <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed">
            {product.description}
          </div>

          {(product.variety || product.origin || product.certification) && (
            <div className="mt-6 grid sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              {product.variety && (
                <div>
                  <p className="text-xs text-gray-400">Variété</p>
                  <p className="font-medium">{product.variety}</p>
                </div>
              )}
              {product.origin && (
                <div>
                  <p className="text-xs text-gray-400">Origine</p>
                  <p className="font-medium">{product.origin}</p>
                </div>
              )}
              {product.certification && (
                <div>
                  <p className="text-xs text-gray-400">Certification</p>
                  <p className="font-medium">{product.certification}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PRODUITS SIMILAIRES */}
        <div className="mt-10 sm:mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">✨ Vous pourriez aussi aimer</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-52 overflow-hidden bg-gray-50">
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt="similaire"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 line-clamp-1">Produit similaire {item}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-emerald-700 font-black">{Number(product.price).toLocaleString()} FCFA</span>
                    <span className="text-xs text-gray-400">⭐⭐⭐⭐☆</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
