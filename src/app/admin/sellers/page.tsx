'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  Wallet,
  Tractor,
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
} from 'lucide-react';

type Order = {
  id: string;
  time: string;
  customer: string;
  address: string;
  phone?: string;
  email?: string;
  products: string[];
  total: string;
  status: 'nouveau' | 'pret' | 'en_route' | 'refused';
};

const initialOrders: Order[] = [
  {
    id: '8821',
    time: 'Il y a 2h',
    customer: 'Jean-Marc Dupuis',
    address: '12 Rue de la Plaine, 64000 Pau',
    phone: '+33 6 12 34 56 78',
    email: 'jeanmarc@example.com',
    products: ['2x Engrais Bio-NPK (25kg)', '1x Semences Maïs (50kg)'],
    total: '1 240,00',
    status: 'nouveau',
  },
  {
    id: '8820',
    time: 'Il y a 5h',
    customer: 'Ferme des Horizons',
    address: 'Route Nationale 7, 26000 Valence',
    phone: '+33 7 98 76 54 32',
    email: 'contact@fermehorizons.fr',
    products: ['10x Filtres à Huile Industriels'],
    total: '450,00',
    status: 'pret',
  },
  {
    id: '8819',
    time: 'Hier, 16:45',
    customer: 'Cécile Martin',
    address: '5 Avenue Verte, 33000 Bordeaux',
    phone: '+33 6 54 32 10 98',
    email: 'cecile.martin@example.com',
    products: ['5x Tuyaux Irrigation 20m', '1x Pompe Solaire 12V'],
    total: '890,50',
    status: 'pret',
  },
];

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmRefuse, setConfirmRefuse] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrepare = (id: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id && order.status === 'nouveau'
          ? { ...order, status: 'pret' }
          : order
      )
    );
  };

  const handleShip = (id: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id && order.status === 'pret'
          ? { ...order, status: 'en_route' }
          : order
      )
    );
  };

  const handleRefuse = (id: string) => {
    setConfirmRefuse(id);
  };

  const confirmRefuseOrder = () => {
    if (confirmRefuse) {
      setOrders(prev => prev.filter(order => order.id !== confirmRefuse));
      if (selectedOrder?.id === confirmRefuse) {
        setModalOpen(false);
        setSelectedOrder(null);
      }
      setConfirmRefuse(null);
    }
  };

  const cancelRefuse = () => {
    setConfirmRefuse(null);
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const stats = [
    {
      title: 'À Préparer',
      value: orders.filter(o => o.status === 'nouveau').length,
      extra: '+12%',
      color: 'text-amber-800',
      bg: 'bg-amber-50',
      icon: Clock,
      border: 'border-l-4 border-amber-500',
    },
    {
      title: 'En Route',
      value: orders.filter(o => o.status === 'en_route').length,
      extra: '+5%',
      color: 'text-blue-800',
      bg: 'bg-blue-50',
      icon: Truck,
      border: 'border-l-4 border-blue-500',
    },
    {
      title: 'Livrées (24h)',
      value: orders.filter(o => o.status === 'pret').length,
      extra: 'Stable',
      color: 'text-emerald-800',
      bg: 'bg-emerald-50',
      icon: CheckCircle,
      border: 'border-l-4 border-emerald-500',
    },
    {
      title: 'Commandes actives',
      value: orders.length,
      extra: 'Total',
      color: 'text-purple-800',
      bg: 'bg-purple-50',
      icon: Package,
      border: 'border-l-4 border-purple-500',
    },
  ];

  if (!mounted) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 min-h-screen flex">
      {/* SIDEBAR desktop */}
      <div className="hidden md:flex w-28 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex-col justify-between shadow-sm">
        <div>
          <div className="h-28 flex items-center justify-center border-b border-gray-100">
            <Tractor size={48} className="text-emerald-700 drop-shadow-sm" />
          </div>
          <nav className="space-y-2 mt-8">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', active: false },
              { icon: ShoppingCart, label: 'Orders', active: true },
              { icon: Package, label: 'Catalog', active: false },
              { icon: MessageSquare, label: 'Messages', active: false },
              { icon: Wallet, label: 'Wallet', active: false },
            ].map((item, idx) => (
              <button
                key={idx}
                className={`w-full py-5 flex flex-col items-center transition-all duration-200 ${
                  item.active
                    ? 'bg-emerald-50 border-r-4 border-emerald-700 text-emerald-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
                title={item.label}
              >
                <item.icon size={28} strokeWidth={1.5} />
                <span className="text-xs font-medium mt-2">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="pb-10 flex justify-center">
          <img
            src="https://i.pravatar.cc/100?img=12"
            className="w-14 h-14 rounded-full ring-2 ring-white shadow-md hover:scale-105 transition"
            alt="profile"
          />
        </div>
      </div>

      {/* Bottom navigation mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around items-center py-3 z-50">
        {[
          { icon: LayoutDashboard, label: 'Dashboard' },
          { icon: ShoppingCart, label: 'Orders', active: true },
          { icon: Package, label: 'Catalog' },
          { icon: MessageSquare, label: 'Messages' },
          { icon: Wallet, label: 'Wallet' },
        ].map((item, idx) => (
          <button
            key={idx}
            className={`flex flex-col items-center py-1 px-4 rounded-lg transition ${
              item.active
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-base text-gray-500">
              <span>Dashboard</span>
              <ChevronRight size={18} />
              <span className="font-semibold text-emerald-800">Commandes</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent mt-3">
              Gestion des Commandes
            </h1>
            <p className="text-gray-500 text-base mt-2 max-w-2xl">
              Visualisez et gérez les commandes entrantes de vos clients.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all text-base">
              <Filter size={20} /> Filtrer
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all text-base">
              <Download size={20} /> Exporter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 ${stat.border}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`${stat.bg} p-3 rounded-xl`}>
                    <Icon size={28} className={stat.color} />
                  </div>
                  <span className={`text-sm font-semibold ${stat.color} bg-white px-3 py-1 rounded-full shadow-sm`}>
                    {stat.extra}
                  </span>
                </div>
                <div className="mt-5 text-gray-500 text-base font-medium">{stat.title}</div>
                <div className={`text-4xl font-extrabold mt-2 ${stat.color}`}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr className="text-left text-gray-500 text-sm md:text-base">
                  <th className="px-6 py-4 font-semibold">Commande</th>
                  <th className="px-6 py-4 font-semibold">Client & Adresse</th>
                  <th className="px-6 py-4 font-semibold">Produits</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="group hover:bg-emerald-50/30 transition-colors duration-150 cursor-pointer"
                    onClick={() => openDetails(order)}
                  >
                    <td className="px-6 py-5 align-top">
                      <div className="font-bold text-emerald-800 text-base">#{order.id}</div>
                      <div className="text-sm text-gray-400 mt-1">{order.time}</div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="font-semibold text-gray-800 text-base">{order.customer}</div>
                      <div className="text-sm text-gray-500 italic flex items-center gap-1 mt-1">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        {order.address.length > 40 ? order.address.slice(0, 37) + '…' : order.address}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-wrap gap-2">
                        {order.products.slice(0, 2).map((p, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                            {p.length > 30 ? p.slice(0, 27) + '…' : p}
                          </span>
                        ))}
                        {order.products.length > 2 && (
                          <span className="text-sm text-gray-500">+{order.products.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="font-bold text-emerald-800 text-xl">{order.total} €</div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      {order.status === 'nouveau' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                          <Clock size={14} /> NOUVEAU
                        </span>
                      )}
                      {order.status === 'pret' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle size={14} /> PRÊT
                        </span>
                      )}
                      {order.status === 'en_route' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 animate-pulse">
                          <Truck size={14} /> EN ROUTE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 align-top text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePrepare(order.id); }}
                          disabled={order.status !== 'nouveau'}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            order.status === 'nouveau'
                              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Préparer
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShip(order.id); }}
                          disabled={order.status !== 'pret'}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            order.status === 'pret'
                              ? 'bg-emerald-700 text-white shadow-md hover:bg-emerald-800 active:scale-95'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Expédier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
            <div className="text-gray-500">
              Affichage de <span className="font-medium">{orders.length}</span> sur{' '}
              <span className="font-medium">14</span> commandes
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronLeft size={18} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-700 text-white font-semibold text-base">
                1
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition">
                2
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETAILS */}
      {modalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText size={24} className="text-emerald-700" />
                Détails de la commande
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <XCircle size={28} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="text-sm text-gray-500">N° commande</div>
                  <div className="font-mono text-xl font-bold text-emerald-800">#{selectedOrder.id}</div>
                  <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={14} /> {selectedOrder.time}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Statut</div>
                  <div className="mt-1">
                    {selectedOrder.status === 'nouveau' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                        <Clock size={14} /> NOUVEAU
                      </span>
                    )}
                    {selectedOrder.status === 'pret' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle size={14} /> PRÊT
                      </span>
                    )}
                    {selectedOrder.status === 'en_route' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 animate-pulse">
                        <Truck size={14} /> EN ROUTE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-1">
                  <User size={18} /> Client
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="font-medium text-base">{selectedOrder.customer}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} /> {selectedOrder.address}
                  </div>
                  {selectedOrder.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} /> {selectedOrder.phone}
                    </div>
                  )}
                  {selectedOrder.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} /> {selectedOrder.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-3">Produits commandés</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {selectedOrder.products.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xl font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-emerald-800">{selectedOrder.total} €</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {selectedOrder.status === 'nouveau' && (
                  <button
                    onClick={() => {
                      handlePrepare(selectedOrder.id);
                      setModalOpen(false);
                    }}
                    className="flex-1 bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 transition text-base"
                  >
                    Préparer la commande
                  </button>
                )}
                {selectedOrder.status === 'pret' && (
                  <button
                    onClick={() => {
                      handleShip(selectedOrder.id);
                      setModalOpen(false);
                    }}
                    className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition text-base"
                  >
                    Expédier maintenant
                  </button>
                )}
                {(selectedOrder.status === 'nouveau' || selectedOrder.status === 'pret') && (
                  <button
                    onClick={() => {
                      handleRefuse(selectedOrder.id);
                      setModalOpen(false);
                    }}
                    className="flex-1 border border-red-300 text-red-700 py-3 rounded-xl font-semibold hover:bg-red-50 transition text-base"
                  >
                    Refuser (rupture de stock)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION REFUS */}
      {confirmRefuse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={28} />
              <h3 className="text-xl font-bold">Refuser la commande</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir refuser cette commande ? Cette action est irréversible. (Rupture de stock)
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelRefuse}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-base"
              >
                Annuler
              </button>
              <button
                onClick={confirmRefuseOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-base"
              >
                Oui, refuser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Mail (icône)
const Mail = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);