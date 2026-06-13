// src/app/admin/sellers/page.tsx
'use client';

import VendorLayout from '@/components/layouts/VendorLayout';
import { useState, useEffect } from 'react';
import {
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  User,
  Calendar,
  XCircle,
  Package,
  TrendingUp,
  Eye,
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Order = {
  id: string;
  time: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  address: string;
  phone?: string;
  email?: string;
  products: string[];
  total: string;
  status: 'nouveau' | 'en_route' | 'livree' | 'terminee' | 'refused';
  sellerConfirmed: boolean;
  clientConfirmed: boolean;
};

function SellerOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmRefuse, setConfirmRefuse] = useState<string | null>(null);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  
  const fetchSellerOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/orders');
      let rawOrders = response.data.data || response.data || [];
      if (!Array.isArray(rawOrders)) rawOrders = [];

      const formattedOrders: Order[] = rawOrders.map((order: any) => {
        let customerName = 'Client';
        let customerEmail = '';
        let customerPhone = '';

        if (order.user) {
          customerName = order.user.name || order.user.first_name || order.user.email || 'Client';
          customerEmail = order.user.email || '';
          customerPhone = order.user.phone || '';
        } else if (order.customer) {
          customerName = order.customer.name || order.customer.email || 'Client';
          customerEmail = order.customer.email || '';
          customerPhone = order.customer.phone || '';
        } else {
          customerName = order.client_name || order.customer_name || 'Client';
          customerEmail = order.client_email || order.email || '';
          customerPhone = order.client_phone || order.phone || '';
        }

        if (customerName === 'Client' && customerEmail) {
          customerName = customerEmail;
        }

        const backendStatus = order.status?.toLowerCase() || '';
        let mappedStatus: Order['status'] = 'nouveau';
        if (backendStatus === 'paid') mappedStatus = 'nouveau';
        else if (['preparing', 'shipping', 'en_route'].includes(backendStatus)) mappedStatus = 'en_route';
        else if (backendStatus === 'delivered') mappedStatus = 'livree';
        else if (backendStatus === 'completed') mappedStatus = 'terminee';
        else if (backendStatus === 'refused' || backendStatus === 'cancelled') mappedStatus = 'refused';

        return {
          id: order.id?.toString() || order.order_number || '?',
          time: formatRelativeTime(order.created_at),
          customer: customerName,
          customerEmail,
          customerPhone,
          address: order.shipping_address || order.address || 'Adresse non fournie',
          phone: customerPhone,
          email: customerEmail,
          products: (order.items || []).map((item: any) =>
            `${item.quantity}x ${item.product?.name || item.product_name || 'Produit'}`
          ),
          total: formatPrice(order.total_amount || order.total || 0),
          status: mappedStatus,
          sellerConfirmed: order.seller_confirmed_delivery || false,
          clientConfirmed: order.client_confirmed_delivery || false,
        };
      });

      setOrders(formattedOrders);
    } catch (error: any) {
      console.error('Erreur fetchSellerOrders:', error);
      toast.error('Impossible de charger les commandes.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Date inconnue';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrepareAndShip = async (id: string) => {
    await fetchSellerOrders();
    const order = orders.find(o => o.id === id);
    if (!order || order.status !== 'nouveau') {
      toast.error('La commande n’est pas encore prête. Réessayez dans quelques secondes.');
      return;
    }
    try {
      await api.put(`/seller/orders/${id}/prepare`);
      await api.put(`/seller/orders/${id}/ship`);
      toast.success('✅ Commande expédiée (en cours de livraison)');
      fetchSellerOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l’expédition');
    }
  };

  const handleConfirmDelivery = async (id: string) => {
    try {
      const response = await api.post(`/seller/orders/${id}/confirm-delivery`);
      if (response.data.success) {
        const order = orders.find(o => o.id === id);
        if (order?.clientConfirmed) {
          toast.success('🎉 Livraison confirmée ! Les fonds ont été versés sur votre wallet.');
        } else {
          toast.success('📦 Livraison confirmée. En attente de la confirmation du client.');
        }
        fetchSellerOrders();
      } else {
        toast.error(response.data.message || 'Erreur lors de la confirmation');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la confirmation');
    }
  };

  const handleRefuse = (id: string) => setConfirmRefuse(id);

  const confirmRefuseOrder = async () => {
    if (confirmRefuse) {
      try {
        await api.post(`/orders/${confirmRefuse}/cancel`);
        toast.success('Commande refusée');
      } catch (error) {
        toast.error('Erreur lors du refus');
      }
      setOrders(prev => prev.filter(order => order.id !== confirmRefuse));
      if (selectedOrder?.id === confirmRefuse) {
        setModalOpen(false);
        setSelectedOrder(null);
      }
      setConfirmRefuse(null);
    }
  };

  const cancelRefuse = () => setConfirmRefuse(null);
  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const totalOrders = orders.length;

  const stats = [
    { title: 'Commandes totales', value: totalOrders, icon: Package, color: 'emerald', change: '+12%' },
    { title: 'À expédier', value: orders.filter(o => o.status === 'nouveau').length, icon: Clock, color: 'amber', change: '' },
    { title: 'En cours', value: orders.filter(o => o.status === 'en_route').length, icon: Truck, color: 'blue', change: '' },
    { title: 'CA total', value: totalRevenue.toLocaleString(), icon: TrendingUp, color: 'purple', change: '' },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-l-emerald-500' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-l-amber-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-l-blue-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-l-purple-500' },
  };

  const statusBadge = (status: Order['status']) => {
    const config = {
      nouveau: { label: 'À EXPÉDIER', icon: Clock, color: 'amber' },
      en_route: { label: 'EN COURS', icon: Truck, color: 'blue' },
      livree: { label: 'LIVRÉE', icon: CheckCircle, color: 'purple' },
      terminee: { label: 'TERMINÉE', icon: CheckCircle, color: 'green' },
      refused: { label: 'REFUSÉE', icon: AlertCircle, color: 'red' },
    };
    const c = config[status] || config.nouveau;
    const Icon = c.icon;
    const colorMap: Record<string, string> = {
      amber: 'bg-amber-100 text-amber-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colorMap[c.color]}`}>
        <Icon size={12} /> {c.label}
      </span>
    );
  };

  // Formatage du numéro de commande plus professionnel (ex: #AGRI-1234)
  const formatOrderNumber = (id: string) => {
    return `#AGR-${id.slice(-6).padStart(6, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Commandes reçues</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les commandes de vos clients</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition">
            <Filter size={14} /> Filtrer
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition">
            <Download size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          return (
            <div key={idx} className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${colors.border}`}>
              <div className="flex items-center justify-between">
                <div className={`${colors.bg} p-1.5 rounded-lg`}>
                  <Icon size={16} className={colors.text} />
                </div>
                {stat.change && <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{stat.change}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.title}</p>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Vue responsive : tableau sur desktop, cartes sur mobile */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucune commande pour le moment.</div>
      ) : (
        <>
          {/* Version desktop (tableau) */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Commande</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Produits</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => openDetails(order)}>
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-emerald-700 text-xs">{formatOrderNumber(order.id)}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">{order.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-sm">{order.customer}</div>
                      <div className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5"><MapPin size={10} /> {order.address.split(',')[0]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {order.products.slice(0, 1).map((p, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{p}</span>
                        ))}
                        {order.products.length > 1 && <span className="text-gray-400 text-[10px]">+{order.products.length-1}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 text-sm">{order.total} FCFA</td>
                    <td className="px-4 py-3">{statusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {order.status === 'nouveau' && (
                          <button onClick={e => { e.stopPropagation(); handlePrepareAndShip(order.id); }} className="px-3 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">Expédier</button>
                        )}
                        {(order.status === 'en_route' || order.status === 'livree') && (
                          <button onClick={e => { e.stopPropagation(); handleConfirmDelivery(order.id); }} className="px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700">Confirmer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version mobile (cartes) */}
          <div className="space-y-3 md:hidden">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 cursor-pointer" onClick={() => openDetails(order)}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-emerald-700 text-xs">{formatOrderNumber(order.id)}</span>
                      <span className="text-gray-400 text-[10px]">{order.time}</span>
                    </div>
                    <div className="mt-1">
                      <p className="font-medium text-gray-800 text-sm">{order.customer}</p>
                      <p className="text-gray-400 text-[10px] flex items-center gap-1"><MapPin size={10} /> {order.address.split(',')[0]}</p>
                    </div>
                  </div>
                  {statusBadge(order.status)}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {order.products.slice(0, 2).map((p, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                    {order.products.length > 2 && <span className="text-gray-400 text-[10px]">+{order.products.length-2}</span>}
                  </div>
                  <span className="font-semibold text-emerald-600 text-sm">{order.total} FCFA</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {order.status === 'nouveau' && (
                    <button onClick={e => { e.stopPropagation(); handlePrepareAndShip(order.id); }} className="flex-1 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">Expédier</button>
                  )}
                  {(order.status === 'en_route' || order.status === 'livree') && (
                    <button onClick={e => { e.stopPropagation(); handleConfirmDelivery(order.id); }} className="flex-1 py-2 rounded-md text-xs font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700">Confirmer livraison</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination simplifiée */}
          <div className="flex justify-center items-center gap-3 text-sm text-gray-500">
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-40"><ChevronLeft size={14} /></button>
            <span className="font-medium">1 / 1</span>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </>
      )}

      {/* Modales (inchangées mais raccourcies) */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Détails commande</h3>
              <button onClick={() => setModalOpen(false)}><XCircle size={20} className="text-gray-400"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div><div className="text-xs text-gray-500">N° commande</div><div className="font-mono font-bold text-emerald-700">{formatOrderNumber(selectedOrder.id)}</div><div className="text-xs text-gray-400">{selectedOrder.time}</div></div>
                {statusBadge(selectedOrder.status)}
              </div>
              <div><h4 className="text-sm font-medium text-gray-700 mb-1">Client</h4><div className="bg-gray-50 p-3 rounded-lg"><p className="text-sm font-medium">{selectedOrder.customer}</p><p className="text-xs text-gray-500 mt-1">{selectedOrder.address}</p>{selectedOrder.phone && <p className="text-xs text-gray-500 mt-1">{selectedOrder.phone}</p>}</div></div>
              <div><h4 className="text-sm font-medium text-gray-700 mb-1">Produits</h4><div className="bg-gray-50 p-3 rounded-lg space-y-1">{selectedOrder.products.map((p,i)=><div key={i} className="text-sm">{p}</div>)}</div></div>
              <div className="flex justify-between items-center pt-2 border-t"><span className="font-medium">Total</span><span className="font-bold text-emerald-600">{selectedOrder.total} FCFA</span></div>
              <div className="flex gap-2">
                {selectedOrder.status === 'nouveau' && <button onClick={()=>{handlePrepareAndShip(selectedOrder.id);setModalOpen(false);}} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium">Expédier</button>}
                {(selectedOrder.status === 'en_route' || selectedOrder.status === 'livree') && <button onClick={()=>{handleConfirmDelivery(selectedOrder.id);setModalOpen(false);}} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Confirmer livraison</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmRefuse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5">
            <div className="flex items-center gap-2 text-red-600 mb-3"><AlertCircle size={20}/><h3 className="font-semibold">Refuser la commande</h3></div>
            <p className="text-sm text-gray-600 mb-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelRefuse} className="px-3 py-1.5 text-sm border rounded-lg">Annuler</button>
              <button onClick={confirmRefuseOrder} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg">Oui, refuser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerOrdersPage() {
  return (
    <VendorLayout>
      <SellerOrdersContent />
    </VendorLayout>
  );
}