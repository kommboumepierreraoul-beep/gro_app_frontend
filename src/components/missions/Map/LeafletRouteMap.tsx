"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Clock } from "lucide-react";

interface LatLng {
  lat: number;
  lng: number;
  label?: string;
}

interface Props {
  origin: LatLng;
  destination: LatLng;
}

function FitBounds({
  origin,
  destination,
}: {
  origin: LatLng;
  destination: LatLng;
}) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [origin, destination, map]);
  return null;
}

function buildIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        width: 30px; height: 30px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); color: white; font-weight: 700; font-size: 12px;">${label}</span>
      </div>
    `,
    className: "gro-route-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  coordinates: [number, number][];
}

export default function LeafletRouteMap({ origin, destination }: Props) {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer l'itinéraire via OSRM (service public de routage open-source)
  useEffect(() => {
    let cancelled = false;

    async function fetchRoute() {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (cancelled) return;

        if (data.routes && data.routes[0]) {
          const r = data.routes[0];
          const coords: [number, number][] = r.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng],
          );
          setRoute({
            distanceKm: r.distance / 1000,
            durationMin: r.duration / 60,
            coordinates: coords,
          });
        }
      } catch {
        // Fallback : ligne droite si OSRM indisponible
        if (!cancelled) {
          setRoute({
            distanceKm: 0,
            durationMin: 0,
            coordinates: [
              [origin.lat, origin.lng],
              [destination.lat, destination.lng],
            ],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [origin, destination]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds origin={origin} destination={destination} />

        <Marker
          position={[origin.lat, origin.lng]}
          icon={buildIcon("#185fa5", "A")}
        >
          <Popup>Votre position</Popup>
        </Marker>

        <Marker
          position={[destination.lat, destination.lng]}
          icon={buildIcon("#154212", "B")}
        >
          <Popup>{destination.label ?? "Lieu de la mission"}</Popup>
        </Marker>

        {route && route.coordinates.length > 1 && (
          <Polyline
            positions={route.coordinates}
            pathOptions={{ color: "#154212", weight: 4, opacity: 0.7 }}
          />
        )}
      </MapContainer>

      {/* Infos itinéraire */}
      {route && route.distanceKm > 0 && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-xl border border-[#c2c9bb]/30 rounded-xl px-4 py-2.5 flex items-center gap-4 shadow-lg z-[1000]">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#154212]">
            <Navigation size={14} />
            {route.distanceKm.toFixed(1)} km
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#42493e]">
            <Clock size={14} />~{Math.round(route.durationMin)} min
          </span>
          <span className="text-[10px] text-[#72796e] ml-auto">en voiture</span>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-[999]">
          <span className="animate-spin w-6 h-6 border-2 border-[#154212] border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
