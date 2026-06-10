// src/app/orders/page.tsx – version corrigée avec suppression fonctionnelle
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Calendar,
  CreditCard,
  FileText,
  Rocket,
  Eye,
  XCircle,
  CheckCircle,
  Truck,
  Package,
  Search,
  Filter,
  Plus,
  Minus,
} from 'lucide-react';

type OrderStatus = 'draft' | 'in_progress' | 'paid' | 'delivered' | 'cancelled';

interface Order {
  id: number;
  orderId: string;
  title: string;
  date: string;
  price: number;
  status: OrderStatus;
  isNew?: boolean;
  address?: string;
  uniqueKey: string;
  sortDate: number;
}

interface SubmittedInfo {
  address: string;
  status: OrderStatus;
  date: string;
  orderId: number;
}

interface ApiOrder {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address?: string;
  items?: { product?: { name: string } }[];
}

interface CartProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

const statusConfig: Record<OrderStatus, { label: string; icon: any; className: string }> = {
  draft: { label: 'Dans le panier', icon: Package, className: 'bg-emerald-100 text-emerald-800' },
  in_progress: { label: 'En cours de livraison', icon: Truck, className: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Payé', icon: CreditCard, className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livré', icon: CheckCircle, className: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Annulé', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState<{ [key: number]: string }>({});
  const [submittedOrders, setSubmittedOrders] = useState<{ [key: number]: SubmittedInfo }>({});
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);

  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentCartItemId, setCurrentCartItemId] = useState<number | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const [cartModalProduct, setCartModalProduct] = useState<CartProduct | null>(null);
  const [cartModalQty, setCartModalQty] = useState(1);

  // Charger submittedOrders depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('submitted_orders');
    if (saved) {
      try { setSubmittedOrders(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('submitted_orders', JSON.stringify(submittedOrders));
  }, [submittedOrders]);

  // Charger les commandes depuis l'API (au montage)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setApiOrders(res.data.data);
      } catch (err) {
        console.error('Erreur chargement commandes:', err);
      }
    };
    fetchOrders();
  }, []);

  // Détecter le retour de paiement NotchPay
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    if (paymentStatus === 'success') {
      const pendingItem = localStorage.getItem('pending_cart_item');
      if (pendingItem) {
        const { cartItemId, address, orderId } = JSON.parse(pendingItem);
        removeItem(cartItemId);
        setSubmittedOrders(prev => ({
          ...prev,
          [cartItemId]: {
            address,
            status: 'paid',
            date: new Date().toLocaleDateString('fr-FR'),
            orderId,
          }
        }));
        setShippingAddresses(prev => {
          const newState = { ...prev };
          delete newState[cartItemId];
          return newState;
        });
        localStorage.removeItem('pending_cart_item');
      }
      toast.success('Paiement effectué avec succès !', { duration: 5000 });
      const refreshOrders = async () => {
        try {
          const res = await api.get('/orders');
          setApiOrders(res.data.data);
        } catch (err) { console.error(err); }
      };
      refreshOrders();
      window.history.replaceState({}, '', '/orders');
    }
  }, [removeItem]);

  // --- Construction des commandes ---
  const cartOrders: Order[] = items
    .filter(item => !submittedOrders[item.id])
    .map(item => ({
      id: item.id,
      orderId: `CART-${item.id}`,
      title: item.name,
      date: '',
      price: item.price * item.quantity,
      status: 'draft' as OrderStatus,
      isNew: true,
      uniqueKey: `cart-${item.id}`,
      sortDate: 0,
    }));

  const allDbOrders: Order[] = apiOrders.map(o => ({
    id: o.id,
    orderId: `ORD-${o.id}`,
    title: o.items?.[0]?.product?.name || 'Commande',
    date: new Date(o.created_at).toLocaleDateString('fr-FR'),
    price: o.total_amount,
    status: o.status === 'paid' ? 'paid' 
          : o.status === 'pending' ? 'draft' 
          : (o.status as OrderStatus),
    isNew: false,
    address: o.shipping_address,
    uniqueKey: `db-${o.id}`,
    sortDate: new Date(o.created_at).getTime(),
  }));

  const notPaidDbOrders = allDbOrders.filter(o => o.status !== 'paid');
  const paidDbOrders = allDbOrders.filter(o => o.status === 'paid');
  const sortedPaidDbOrders = [...paidDbOrders].sort((a, b) => b.sortDate - a.sortDate);

  const allNotPaid = [...cartOrders, ...notPaidDbOrders];
  const orders = [...allNotPaid, ...sortedPaidDbOrders];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(search.toLowerCase()) ||
                          order.orderId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const openDetails = (order: Order) => { setSelectedOrder(order); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedOrder(null); };

  const openCartModal = (e: React.MouseEvent, cartItemId: number) => {
    e.stopPropagation();
    const item = items.find(i => i.id === cartItemId);
    if (!item) return;
    setCartModalProduct(item);
    setCartModalQty(item.quantity);
  };

  const confirmCartModal = () => {
    if (!cartModalProduct) return;
    updateQuantity(cartModalProduct.id, cartModalQty);
    setCartModalProduct(null);
  };

  const handleLaunchOrder = async (cartItemId: number) => {
    const address = shippingAddresses[cartItemId];
    if (!address) {
      alert('Veuillez entrer une adresse de livraison');
      return;
    }
    const item = items.find(i => i.id === cartItemId);
    if (!item) return;

    try {
      const res = await api.post('/orders', {
        shipping_address: address,
        items: [{ product_id: item.id, quantity: item.quantity }]
      });
      const createdOrderId = res.data.data.id;
      setPendingOrderId(createdOrderId);
      setCurrentCartItemId(cartItemId);
      setCurrentAddress(address);
      setPaymentModalOpen(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erreur lors de la création de la commande');
    }
  };

  const payWithWallet = async () => {
    if (!pendingOrderId || !currentCartItemId) return;
    setPaymentLoading(true);
    try {
      await api.post(`/orders/${pendingOrderId}/pay/wallet`);
      removeItem(currentCartItemId);
      setSubmittedOrders(prev => ({
        ...prev,
        [currentCartItemId]: {
          address: currentAddress,
          status: 'paid',
          date: new Date().toLocaleDateString('fr-FR'),
          orderId: pendingOrderId,
        }
      }));
      setShippingAddresses(prev => {
        const newState = { ...prev };
        delete newState[currentCartItemId];
        return newState;
      });
      setPaymentModalOpen(false);
      setPendingOrderId(null);
      setCurrentCartItemId(null);
      setCurrentAddress('');
      toast.success('Paiement effectué avec succès !', { duration: 5000 });
      const refreshOrders = async () => {
        try {
          const res = await api.get('/orders');
          setApiOrders(res.data.data);
        } catch (err) { console.error(err); }
      };
      refreshOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Solde insuffisant ou erreur de paiement');
    } finally {
      setPaymentLoading(false);
    }
  };

  const payWithNotchPay = async () => {
    if (!pendingOrderId || !currentCartItemId) return;
    setPaymentLoading(true);
    try {
      const res = await api.post(`/orders/${pendingOrderId}/pay/notchpay`);
      localStorage.setItem('pending_cart_item', JSON.stringify({
        cartItemId: currentCartItemId,
        address: currentAddress,
        orderId: pendingOrderId,
      }));
      window.location.href = res.data.authorization_url;
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erreur NotchPay');
      setPaymentLoading(false);
    }
  };

  const handleConfirmDelivery = (id: number) => alert(`Livraison confirmée pour la commande ${id}`);
  const handleCancelOrder = (id: number) => confirm('Annuler ?') && alert(`Commande ${id} annulée`);
  const handleReorder = (id: number) => alert(`Recommander ${id}`);

  // Suppression avec rechargement pour garantir la mise à jour
  const deleteCartItem = (id: number) => {
    removeItem(id);
    setSubmittedOrders(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setShippingAddresses(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    // Forcer un rechargement pour que la carte disparaisse immédiatement
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      {/* Header (identique) */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm h-16">
        <div className="flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto h-full">
          <span className="text-xl font-bold text-emerald-800">AgriTech</span>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/marketplace" className="text-gray-600 hover:text-emerald-700">Market</Link>
            <Link href="/orders" className="text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5">Orders</Link>
            <Link href="#" className="text-gray-600 hover:text-emerald-700">Earnings</Link>
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <img alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN4qAn25zOvJa3N8xYB0jQGzob065jsy-BqSXhqSlb2IvzjEONKA-TlPCoGsUq8M2RmrRm9bLmovwx8v43K3jjQjDg8oY-6sntnlGk9EOi58LrUTqIb0UHy4N5-WkCh9c5eOfIuX6THO5FdNWefnJ2DGMLYhscuLdiS_VyeGs2B7sPbY0Yf8fhCKw030x2BXvbo9HhlnSEsBAw0F54LlQyrNHQS1zmp6aY6_Mh3g2L-yYNRVyhwBvnCvDXy7rm6Br9Gh_3iI6RGo5H" className="w-full h-full object-cover" />
            </div>
            <button className="text-gray-600 hover:text-emerald-700">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative mb-10 rounded-2xl overflow-hidden h-40 md:h-48 flex flex-col justify-center px-8 md:px-10 bg-gradient-to-r from-emerald-800 to-emerald-600 shadow-lg">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Mes Commandes</h1>
            <p className="text-white/80 text-sm">Gérez vos acquisitions de intrants et équipements en temps réel.</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une commande par ID ou produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                {['all', 'draft', 'in_progress', 'paid', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                      filter === status ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Tous' : statusConfig[status as OrderStatus]?.label || status}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-50 shadow-sm">
                <Filter size={16} /> Filtres
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-5">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const cartItem = items.find(i => i.id === order.id);
              const isDraft = order.status === 'draft';
              return (
                <div
                  key={order.uniqueKey}
                  onClick={() => openDetails(order)}
                  className={`group bg-white rounded-xl border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    isDraft ? 'border-l-emerald-500 shadow-sm' : 'border-l-gray-200 hover:border-l-emerald-300'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {order.orderId}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 mt-1">{order.title}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${status.className}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </div>

                    {isDraft && cartItem && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-500">Quantité :</span>
                        <button
                          onClick={(e) => openCartModal(e, order.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <span className="font-bold">{cartItem.quantity}</span>
                          <span className="text-xs">— modifier</span>
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-gray-500 text-sm mt-3">
                      {order.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={16} />
                          <span>{order.date}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={16} />
                        <span className="font-semibold text-gray-800">{order.price.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4">
                      {order.status === 'draft' && (
                        <>
                          <input
                            type="text"
                            placeholder="Adresse de livraison"
                            value={shippingAddresses[order.id] || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              setShippingAddresses(prev => ({ ...prev, [order.id]: e.target.value }));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLaunchOrder(order.id); }}
                            className="px-5 py-2 bg-emerald-700 text-white text-sm rounded-full flex items-center gap-1.5 hover:bg-emerald-800"
                          >
                            <Rocket size={16} /> Lancer & Payer
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCartItem(order.id);
                            }}
                            className="px-4 py-2 border border-red-200 text-red-500 text-sm rounded-full hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                      {order.status === 'in_progress' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); openDetails(order); }} className="px-5 py-2 bg-emerald-700 text-white text-sm rounded-full flex items-center gap-1.5">
                            <Eye size={16} /> Détails
                          </button>
                          <button onClick={(e) => e.stopPropagation()} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-full flex items-center gap-1">
                            <FileText size={16} /> Facture PDF
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleConfirmDelivery(order.id); }} className="px-5 py-2 bg-emerald-100 text-emerald-800 text-sm rounded-full">
                            Confirmer réception
                          </button>
                        </>
                      )}
                      {order.status === 'paid' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); openDetails(order); }} className="px-5 py-2 bg-emerald-700 text-white text-sm rounded-full">
                            Détails
                          </button>
                          <button onClick={(e) => e.stopPropagation()} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-full flex items-center gap-1">
                            <FileText size={16} /> Facture PDF
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }} className="px-5 py-2 border border-red-300 text-red-700 text-sm rounded-full hover:bg-red-50">
                            Annuler
                          </button>
                        </>
                      )}
                      {order.status === 'delivered' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); openDetails(order); }} className="px-5 py-2 bg-emerald-700 text-white text-sm rounded-full">
                            Détails
                          </button>
                          <button onClick={(e) => e.stopPropagation()} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-full flex items-center gap-1">
                            <FileText size={16} /> Facture PDF
                          </button>
                        </>
                      )}
                      {order.status === 'cancelled' && (
                        <button onClick={(e) => { e.stopPropagation(); handleReorder(order.id); }} className="px-5 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200">
                          Recommander
                        </button>
                      )}
                    </div>

                    {order.address && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1 pt-1 border-t border-gray-100">
                        📍 {order.address}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune commande trouvée</h3>
                <p className="text-gray-500 mb-6">Ajoutez des produits depuis le marketplace.</p>
                <Link href="/marketplace" className="px-6 py-2.5 bg-emerald-700 text-white text-sm rounded-full shadow-md hover:bg-emerald-800">
                  Explorer le catalogue
                </Link>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-base font-semibold mb-5 text-gray-800">Activité Récente</h3>
              <div className="relative pl-8">
                <div className="absolute left-[13px] top-1 bottom-1 w-[2px] bg-gray-200"></div>
                {sortedPaidDbOrders.slice(0, 3).map((o, idx) => (
                  <div key={o.uniqueKey} className={`${idx < 2 ? 'mb-6' : ''} relative`}>
                    <div className="absolute -left-[23px] top-0 w-6 h-6 bg-white rounded-full border-2 border-emerald-500 flex items-center justify-center">
                      <Package size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{o.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{o.date}</p>
                  </div>
                ))}
                {sortedPaidDbOrders.length === 0 && <p className="text-sm text-gray-400">Aucune activité récente</p>}
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-xl p-5 text-white shadow-md">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" fill="transparent" r="26" stroke="rgba(255,255,255,0.3)" strokeWidth="6"></circle>
                    <circle cx="32" cy="32" fill="transparent" r="26" stroke="#ffffff" strokeDasharray="163" strokeDashoffset="41" strokeWidth="6" strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{items.length}</span>
                </div>
                <div>
                  <p className="text-xs uppercase text-white/70">Panier actuel</p>
                  <p className="text-base font-semibold">{items.length} article(s)</p>
                  <p className="text-sm text-white/80">{totalPrice.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal quantité */}
      {cartModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCartModalProduct(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Modifier la quantité</h2>
              <button onClick={() => setCartModalProduct(null)}><XCircle size={22} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            {cartModalProduct.image && <img src={cartModalProduct.image} alt={cartModalProduct.name} className="w-full h-40 object-cover rounded-xl mb-4" />}
            <p className="font-semibold text-gray-800 mb-1">{cartModalProduct.name}</p>
            <p className="text-emerald-700 font-bold mb-4">{cartModalProduct.price.toLocaleString()} FCFA / unité</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setCartModalQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><Minus size={18} /></button>
              <span className="text-2xl font-black w-12 text-center">{cartModalQty}</span>
              <button onClick={() => setCartModalQty(q => q + 1)} className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition text-emerald-700"><Plus size={18} /></button>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
              <span>Total</span>
              <span className="font-black text-gray-800 text-lg">{(cartModalProduct.price * cartModalQty).toLocaleString()} FCFA</span>
            </div>
            <button onClick={confirmCartModal} className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition">Confirmer</button>
          </div>
        </div>
      )}

      {/* Modal paiement */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Choisir le mode de paiement</h2>
            <p className="text-sm text-gray-500 mb-6">
              Total à payer : <span className="font-bold text-emerald-700">{totalPrice.toLocaleString()} FCFA</span>
            </p>
            <div className="space-y-3">
              <button onClick={payWithWallet} disabled={paymentLoading} className="w-full py-4 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center gap-3 hover:bg-emerald-800 disabled:opacity-60 transition">
                <CreditCard size={20} /> Payer avec mon Wallet
              </button>
              <button onClick={payWithNotchPay} disabled={paymentLoading} className="w-full py-4 rounded-xl border-2 border-emerald-700 text-emerald-700 font-bold flex items-center justify-center gap-3 hover:bg-emerald-50 disabled:opacity-60 transition">
                <Rocket size={20} /> Payer avec NotchPay
              </button>
              <button onClick={() => { setPaymentModalOpen(false); setPendingOrderId(null); setCurrentCartItemId(null); }} className="w-full py-3 rounded-xl text-gray-500 text-sm hover:bg-gray-100 transition">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Package size={22} className="text-emerald-700" /> Détails de la commande</h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100 transition"><XCircle size={24} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-col md:flex-row justify-between gap-4 pb-3 border-b border-gray-100">
                <div>
                  <div className="text-sm text-gray-500">N° commande</div>
                  <div className="font-mono text-lg font-bold text-emerald-800">{selectedOrder.orderId}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Calendar size={12} /> {selectedOrder.date || 'Non finalisée'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Statut</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800">
                    {(() => { const Icon = statusConfig[selectedOrder.status].icon; return <Icon size={16} />; })()}
                    {statusConfig[selectedOrder.status].label}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Produit</h3>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="font-medium">{selectedOrder.title}</div>
                  <div className="text-sm text-gray-500 mt-1">Prix : {selectedOrder.price.toLocaleString()} FCFA</div>
                  {selectedOrder.address && <div className="text-sm text-gray-500 mt-1">📍 {selectedOrder.address}</div>}
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-emerald-800">{selectedOrder.price.toLocaleString()} FCFA</span>
              </div>
              <button onClick={closeModal} className="w-full bg-gray-700 text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}