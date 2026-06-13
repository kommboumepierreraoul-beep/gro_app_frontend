'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/lib/axios';
import { Package, Truck, MapPin, Navigation } from 'lucide-react';

// Correction des icônes Leaflet (problème connu avec Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TrackOrderPage() {
  const { orderNumber } = useParams();
  const [email, setEmail] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<L.Map | null>(null);
  const clientMarkerRef = useRef<L.Marker | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);

  const authenticate = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/tracking/${orderNumber}`, { params: { email } });
      if (res.data) {
        setTrackingData(res.data);
        setAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur d\'authentification');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosition = async () => {
    if (!authenticated) return;
    try {
      const res = await api.get(`/tracking/${orderNumber}`, { params: { email } });
      setTrackingData(res.data);
    } catch (err) {
      console.error('Erreur mise à jour position', err);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    // Mise à jour toutes les 5 secondes
    const interval = setInterval(fetchPosition, 5000);
    return () => clearInterval(interval);
  }, [authenticated, email]);

  useEffect(() => {
    if (!authenticated || !trackingData || !mapRef.current) return;

    const { client, delivery } = trackingData;
    if (!client || !delivery) return;

    // Centre la carte sur le client ou le livreur
    const center = client.lat && client.lng ? [client.lat, client.lng] : [delivery.lat, delivery.lng];
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(center, 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView(center, 13);
    }

    // Marqueur client
    if (clientMarkerRef.current) clientMarkerRef.current.remove();
    clientMarkerRef.current = L.marker([client.lat, client.lng], {
      icon: L.divIcon({ html: '<div class="bg-blue-600 p-2 rounded-full"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>' }),
    }).addTo(mapRef.current).bindPopup('Votre adresse');

    // Marqueur livreur
    if (deliveryMarkerRef.current) deliveryMarkerRef.current.remove();
    deliveryMarkerRef.current = L.marker([delivery.lat, delivery.lng], {
      icon: L.divIcon({ html: '<div class="bg-emerald-600 p-2 rounded-full animate-pulse"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>' }),
    }).addTo(mapRef.current).bindPopup('Votre livreur');

    // Optionnel : tracer une ligne entre les deux points
    // L.polyline([[client.lat, client.lng], [delivery.lat, delivery.lng]], { color: 'blue' }).addTo(mapRef.current);
  }, [trackingData, authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <Package className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-800">Suivi en temps réel</h1>
            <p className="text-gray-500 text-sm">Saisissez l’email de votre commande</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="client@exemple.com"
            />
            <button
              onClick={authenticate}
              disabled={!email || loading}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Suivre ma commande'}
            </button>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) return <div className="text-center p-8">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Suivi commande #{orderNumber}</h1>
            <p className="text-sm text-gray-500">Statut : {trackingData.status === 'shipping' ? 'En cours de livraison' : trackingData.status}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Navigation size={16} className="text-emerald-600" />
            Mise à jour automatique toutes les 5 secondes
          </div>
        </div>
        <div id="map" style={{ height: '500px', width: '100%', borderRadius: '1rem', zIndex: 1 }} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 mb-2"><MapPin size={18} /> Votre position</div>
            <p className="text-sm text-gray-600">{trackingData.client?.lat}, {trackingData.client?.lng}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 mb-2"><Truck size={18} /> Position du livreur</div>
            <p className="text-sm text-gray-600">{trackingData.delivery?.lat}, {trackingData.delivery?.lng}</p>
          </div>
        </div>
      </div>
    </div>
  );
}