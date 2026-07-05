'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productService } from '@/services/product.service';
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

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (params?.id) {
      loadProduct();
    }
  }, [params?.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productId = Number(params.id);
      
      if (isNaN(productId)) {
        throw new Error('ID du produit invalide');
      }

      // ✅ Appel API avec gestion correcte de la réponse
      const response: any = await productService.getProduct(productId);
      
      // ✅ Extraction correcte des données quel que soit le format
      let productData = response?.data?.data ?? response?.data ?? response;

      console.log("PRODUCT =", productData);
      console.log("SHOP =", productData?.shop);
      console.log("LOGO =", productData?.shop?.logo);
      console.log("BANNER =", productData?.shop?.banner);

      if (!productData) {
        throw new Error('Produit introuvable');
      }

      setProduct(productData);

      if (productData.images?.length > 0) {
        setSelectedImage(productData.images[0]);
      }

    } catch (err: any) {
      console.error('Erreur de chargement:', err);
      
      // ✅ Gestion des erreurs plus précise
      if (err.response?.status === 404) {
        setError('Produit non trouvé');
        toast.error('Produit non trouvé');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur, veuillez réessayer plus tard');
        toast.error('Erreur serveur');
      } else if (err.response?.status === 401) {
        setError('Session expirée, veuillez vous reconnecter');
        toast.error('Session expirée');
      } else {
        setError(err.message || 'Erreur lors du chargement du produit');
        toast.error(err.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const toggleWishlist = async () => {
    try {
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch (error) {
      toast.error('Erreur');
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
      <main className="mx-auto max-w-7xl px-0 py-5 sm:py-6">
        {/* Fil d'Ariane */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/marketplace" className="hover:text-emerald-600 transition">Marketplace</a>
          <span>›</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {product.category?.name || 'Agriculture'}
                </span>
              </div>
            </div>

            {/* Évaluation */}
            <div className="flex items-center gap-3 border-y border-gray-100 py-4">
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
              <div className="text-4xl font-black text-emerald-700">
                {Number(product.price).toLocaleString()} <span className="text-xl font-medium">FCFA</span>
              </div>
              {product.unit_price && (
                <div className="text-sm text-emerald-600 mt-1">Soit {product.unit_price} FCFA / unité</div>
              )}
            </div>

            {/* Quantité et actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
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

              <div className="flex justify-between gap-3 pt-2">
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
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={product.shop?.logo || 'https://via.placeholder.com/48'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                  alt="shop"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-800">{product.shop?.name || 'Vendeur partenaire'}</h4>
                  <p className="text-xs text-gray-500">Vendeur vérifié • 98% de satisfaction</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-full border border-emerald-600 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contacter
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPTION DÉTAILLÉE */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
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
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">✨ Vous pourriez aussi aimer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
