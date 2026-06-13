'use client';

import VendorLayout from '@/components/layouts/VendorLayout';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Calendar, CreditCard, FileText, Rocket, XCircle,
  CheckCircle, Truck, Package, Search, Filter, Plus, Minus, AlertCircle,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  draft:      { label: 'Dans le panier',        icon: Package,     className: 'bg-emerald-100 text-emerald-800' },
  pending:    { label: 'En attente de paiement',icon: CreditCard,  className: 'bg-yellow-100 text-yellow-800' },
  paid:       { label: 'Payé',                  icon: CreditCard,  className: 'bg-purple-100 text-purple-800' },
  preparing:  { label: 'En préparation',         icon: Package,     className: 'bg-blue-100 text-blue-800' },
  shipping:   { label: 'En cours de livraison', icon: Truck,       className: 'bg-blue-100 text-blue-800' },
  delivered:  { label: 'Livré',                 icon: CheckCircle, className: 'bg-gray-100 text-gray-700' },
  completed:  { label: 'Terminée',              icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Annulé',                icon: XCircle,     className: 'bg-red-100 text-red-700' },
};

interface Order {
  id: number;
  orderId: string;
  title: string;
  date: string;
  price: number;
  status: string;
  address?: string;
  uniqueKey: string;
  clientConfirmed?: boolean;
}

interface ApiOrder {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address?: string;
  client_confirmed_delivery?: boolean;
  items?: { product?: { name: string } }[];
}

interface CartProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

function OrdersContent() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState<{ [key: number]: string }>({});
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentCartItemId, setCurrentCartItemId] = useState<number | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [cartModalProduct, setCartModalProduct] = useState<CartProduct | null>(null);
  const [cartModalQty, setCartModalQty] = useState(1);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setApiOrders(res.data.data ?? []);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');

    if (paymentStatus === 'success') {
      toast.success('Paiement effectué avec succès !');
      setTimeout(() => fetchOrders(), 2000);
      window.history.replaceState({}, '', '/orders');
    } else if (paymentStatus === 'cancel') {
      toast.error('Paiement annulé.');
      window.history.replaceState({}, '', '/orders');
    }
  }, []);

  const cartOrders: Order[] = items.map(item => ({
    id: item.id,
    orderId: `CART-${item.id}`,
    title: item.name,
    date: '',
    price: item.price * item.quantity,
    status: 'draft',
    uniqueKey: `cart-${item.id}`,
  }));

  const dbOrders: Order[] = apiOrders.map(o => ({
    id: o.id,
    orderId: o.order_number,
    title: o.items?.[0]?.product?.name || 'Commande',
    date: new Date(o.created_at).toLocaleDateString('fr-FR'),
    price: o.total_amount,
    status: o.status,
    address: o.shipping_address,
    uniqueKey: `db-${o.id}`,
    clientConfirmed: o.client_confirmed_delivery,
  }));

  const orders = [...cartOrders, ...dbOrders];

  const filteredOrders = orders.filter(order =>
    (order.title.toLowerCase().includes(search.toLowerCase()) ||
     order.orderId.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || order.status === filter)
  );

  const handleLaunchOrder = async (cartItemId: number) => {
    const address = shippingAddresses[cartItemId];
    if (!address) { toast.error('Veuillez entrer une adresse de livraison'); return; }
    const item = items.find(i => i.id === cartItemId);
    if (!item) return;
    try {
      const res = await api.post('/orders', {
        shipping_address: address,
        items: [{ product_id: item.id, quantity: item.quantity, price: item.price }],
      });
      setPendingOrderId(res.data.data.id);
      setCurrentCartItemId(cartItemId);
      setCurrentAddress(address);
      setPaymentModalOpen(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur création commande');
    }
  };

  const payWithWallet = async () => {
    if (!pendingOrderId || !currentCartItemId) return;
    setPaymentLoading(true);
    try {
      await api.post(`/orders/${pendingOrderId}/pay/wallet`);
      removeItem(currentCartItemId);
      setPaymentModalOpen(false);
      setPendingOrderId(null); setCurrentCartItemId(null);
      toast.success('Paiement effectué !');
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Solde insuffisant');
    } finally { setPaymentLoading(false); }
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
        reference: res.data.reference,
        orderNumber: res.data.order_number,
      }));
      window.location.href = res.data.authorization_url;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur NotchPay');
      setPaymentLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId: number) => {
    try {
      await api.post(`/orders/${orderId}/confirm-delivery`, { role: 'client' });
      toast.success('Livraison confirmée !');
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur confirmation');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Annuler cette commande ?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      toast.success('Commande annulée');
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur annulation');
    }
  };

  const handleInvoice = async (orderId: number) => {
    try {
      const res = await api.post(`/invoices/generate/${orderId}`);
      if (res.data.download_url) {
        window.open(res.data.download_url, '_blank');
      } else {
        toast.success(res.data.message || 'Facture générée');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Impossible de générer la facture';
      toast.error(msg);
    }
  };

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

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm h-16">
        <div className="flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto h-full">
          <span className="text-xl font-bold text-emerald-800">AgriTech</span>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/marketplace" className="text-gray-600 hover:text-emerald-700">Market</Link>
            <Link href="/orders" className="text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5">Orders</Link>
          </nav>
        </div>
      </header>

      <main className="pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative mb-10 rounded-2xl overflow-hidden h-40 flex flex-col justify-center px-8 bg-gradient-to-r from-emerald-800 to-emerald-600 shadow-lg">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white mb-1">Mes Commandes</h1>
            <p className="text-white/80 text-sm">Gérez vos acquisitions en temps réel.</p>
          </div>
        </div>

        <div className="mb-8 bg-white/70 rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-full flex-wrap">
            {['all', 'draft', 'paid', 'preparing', 'shipping', 'delivered', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${filter === s ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {s === 'all' ? 'Tous' : statusConfig[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-5">
            {filteredOrders.map((order) => {
              const st = statusConfig[order.status] || { label: order.status, icon: AlertCircle, className: 'bg-gray-100 text-gray-700' };
              const StatusIcon = st.icon;
              const cartItem = items.find(i => i.id === order.id);

              return (
                <div
                  key={order.uniqueKey}
                  onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
                  className={`bg-white rounded-xl border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    order.status === 'draft' ? 'border-l-emerald-500' : 'border-l-gray-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                      <div>
                        <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{order.orderId}</span>
                        <h3 className="text-lg font-semibold text-gray-800 mt-1">{order.title}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${st.className}`}>
                        <StatusIcon size={14} /> {st.label}
                      </span>
                    </div>

                    {order.status === 'draft' && cartItem && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-500">Quantité :</span>
                        <button
                          onClick={(e) => openCartModal(e, order.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 hover:bg-emerald-100"
                        >
                          <span className="font-bold">{cartItem.quantity}</span>
                          <span className="text-xs">— modifier</span>
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                      {order.date && <div className="flex items-center gap-1.5"><Calendar size={16} /><span>{order.date}</span></div>}
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={16} />
                        <span className="font-semibold text-gray-800">{order.price.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3" onClick={(e) => e.stopPropagation()}>
                      {order.status === 'draft' && (
                        <>
                          <input
                            type="text"
                            placeholder="Adresse de livraison"
                            value={shippingAddresses[order.id] || ''}
                            onChange={(e) => setShippingAddresses(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-1"
                          />
                          <button onClick={() => handleLaunchOrder(order.id)} className="px-5 py-2 bg-emerald-700 text-white text-sm rounded-full flex items-center gap-1.5 hover:bg-emerald-800">
                            <Rocket size={16} /> Lancer & Payer
                          </button>
                          <button onClick={() => removeItem(order.id)} className="px-4 py-2 border border-red-200 text-red-500 text-sm rounded-full hover:bg-red-50">
                            Supprimer
                          </button>
                        </>
                      )}

                      {order.status === 'paid' && (
                        <button onClick={() => handleCancelOrder(order.id)} className="px-5 py-2 border border-red-300 text-red-700 text-sm rounded-full hover:bg-red-50">
                          Annuler
                        </button>
                      )}

                      {order.status === 'shipping' && !order.clientConfirmed && (
                        <>
                          <button
                            onClick={() => handleConfirmDelivery(order.id)}
                            className="px-5 py-2 bg-emerald-700 text-white text-sm rounded-full flex items-center gap-1.5 hover:bg-emerald-800"
                          >
                            <CheckCircle size={16} /> Confirmer la réception
                          </button>
                          <button
                            onClick={() => window.open(`/track/${order.orderId}`, '_blank')}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                          >
                            Suivre
                          </button>
                        </>
                      )}

                      {order.status === 'shipping' && order.clientConfirmed && (
                        <>
                          <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-full">
                            ✅ Réception confirmée — en attente vendeur
                          </span>
                          <button
                            onClick={() => window.open(`/track/${order.orderId}`, '_blank')}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                          >
                            Suivre
                          </button>
                        </>
                      )}

                      {(order.status === 'paid' || order.status === 'preparing' || order.status === 'shipping' || order.status === 'delivered' || order.status === 'completed') && (
                        <button
                          onClick={() => handleInvoice(order.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-full flex items-center gap-1 hover:bg-gray-50 transition"
                        >
                          <FileText size={16} /> Facture PDF
                        </button>
                      )}
                    </div>

                    {order.address && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1 pt-2 border-t border-gray-100">
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
                <div className="absolute left-[13px] top-1 bottom-1 w-[2px] bg-gray-200" />
                {dbOrders.slice(0, 3).map((o, idx) => (
                  <div key={o.uniqueKey} className={`${idx < 2 ? 'mb-6' : ''} relative`}>
                    <div className="absolute -left-[23px] top-0 w-6 h-6 bg-white rounded-full border-2 border-emerald-500 flex items-center justify-center">
                      <Package size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{o.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{o.date}</p>
                  </div>
                ))}
                {dbOrders.length === 0 && <p className="text-sm text-gray-400">Aucune activité récente</p>}
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-xl p-5 text-white shadow-md">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" fill="transparent" r="26" stroke="rgba(255,255,255,0.3)" strokeWidth="6" />
                    <circle cx="32" cy="32" fill="transparent" r="26" stroke="#ffffff" strokeDasharray="163" strokeDashoffset="41" strokeWidth="6" strokeLinecap="round" />
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

      {cartModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCartModalProduct(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Modifier la quantité</h2>
              <button onClick={() => setCartModalProduct(null)}><XCircle size={22} className="text-gray-400" /></button>
            </div>
            <p className="font-semibold text-gray-800 mb-1">{cartModalProduct.name}</p>
            <p className="text-emerald-700 font-bold mb-4">{cartModalProduct.price.toLocaleString()} FCFA / unité</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setCartModalQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Minus size={18} /></button>
              <span className="text-2xl font-black w-12 text-center">{cartModalQty}</span>
              <button onClick={() => setCartModalQty(q => q + 1)} className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 hover:bg-emerald-200"><Plus size={18} /></button>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
              <span>Total</span>
              <span className="font-black text-gray-800 text-lg">{(cartModalProduct.price * cartModalQty).toLocaleString()} FCFA</span>
            </div>
            <button onClick={confirmCartModal} className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800">Confirmer</button>
          </div>
        </div>
      )}

      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mode de paiement</h2>
            <p className="text-sm text-gray-500 mb-6">
              Total : <span className="font-bold text-emerald-700">
                {(items.find(i => i.id === currentCartItemId)?.price ?? 0) *
                 (items.find(i => i.id === currentCartItemId)?.quantity ?? 1)} FCFA
              </span>
            </p>
            <div className="space-y-3">
              <button onClick={payWithWallet} disabled={paymentLoading} className="w-full py-4 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center gap-3 hover:bg-emerald-800 disabled:opacity-60">
                <CreditCard size={20} /> Payer avec mon Wallet
              </button>
              <button onClick={payWithNotchPay} disabled={paymentLoading} className="w-full py-4 rounded-xl border-2 border-emerald-700 text-emerald-700 font-bold flex items-center justify-center gap-3 hover:bg-emerald-50 disabled:opacity-60">
                <Rocket size={20} /> Payer avec NotchPay
              </button>
              <button onClick={() => { setPaymentModalOpen(false); setPendingOrderId(null); setCurrentCartItemId(null); }} className="w-full py-3 rounded-xl text-gray-500 text-sm hover:bg-gray-100">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Package size={22} className="text-emerald-700" /> Détails</h2>
              <button onClick={() => setModalOpen(false)}><XCircle size={24} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="text-sm text-gray-500">N° commande</div>
                  <div className="font-mono text-lg font-bold text-emerald-800">{selectedOrder.orderId}</div>
                  <div className="text-xs text-gray-400 mt-1">{selectedOrder.date || 'Non finalisée'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Statut</div>
                  <span className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${statusConfig[selectedOrder.status]?.className || 'bg-gray-100'}`}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="font-medium">{selectedOrder.title}</div>
                <div className="text-sm text-gray-500 mt-1">Prix : {selectedOrder.price.toLocaleString()} FCFA</div>
                {selectedOrder.address && <div className="text-sm text-gray-500 mt-1">📍 {selectedOrder.address}</div>}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-extrabold text-emerald-800">{selectedOrder.price.toLocaleString()} FCFA</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-full bg-gray-700 text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <VendorLayout>
      <OrdersContent />
    </VendorLayout>
  );
}