"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/lib/axios";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Navigation,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type TrackPoint = {
  lat?: string | number | null;
  lng?: string | number | null;
};

type TrackingData = {
  status?: string;
  client?: TrackPoint | null;
  delivery?: TrackPoint | null;
  order?: {
    total_amount?: number | string;
    created_at?: string;
  };
  eta?: string;
};

function pointToLatLng(point?: TrackPoint | null): L.LatLngTuple | null {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    draft: "Panier cree",
    paid: "Commande payee",
    preparing: "Preparation",
    shipping: "En livraison",
    delivered: "Livree",
    completed: "Terminee",
    cancelled: "Annulee",
  };
  return labels[status ?? ""] ?? status ?? "Suivi en cours";
}

function markerHtml(kind: "client" | "delivery") {
  const bg = kind === "client" ? "#2563eb" : "#047857";
  const pulse = kind === "delivery" ? "track-pulse" : "";
  return `
    <div class="${pulse}" style="width:34px;height:34px;border-radius:999px;background:${bg};display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(15,23,42,.24);border:3px solid white;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `;
}

export default function TrackOrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = String(params?.orderNumber ?? "");
  const [email, setEmail] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clientMarkerRef = useRef<L.Marker | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const loadTracking = useCallback(async () => {
    const response = await api.get(`/tracking/${orderNumber}`, {
      params: { email },
    });
    setTrackingData(response.data);
    setLastUpdated(new Date());
    return response.data as TrackingData;
  }, [email, orderNumber]);

  const authenticate = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await loadTracking();
      setAuthenticated(true);
    } catch (err: unknown) {
      const apiError =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string; message?: string } } })
              .response?.data
          : undefined;
      setError(
        apiError?.error ||
          apiError?.message ||
          "Impossible de verifier cette commande",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    const interval = window.setInterval(() => {
      loadTracking().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [authenticated, loadTracking]);

  useEffect(() => {
    const client = pointToLatLng(trackingData?.client);
    const delivery = pointToLatLng(trackingData?.delivery);
    const firstPoint = client ?? delivery;

    if (!authenticated || !firstPoint || !mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(firstPoint, 13);

      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
        },
      ).addTo(mapRef.current);
    }

    const map = mapRef.current;

    if (client) {
      if (clientMarkerRef.current) clientMarkerRef.current.remove();
      clientMarkerRef.current = L.marker(client, {
        icon: L.divIcon({
          html: markerHtml("client"),
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
      })
        .addTo(map)
        .bindPopup("Adresse de livraison");
    }

    if (delivery) {
      if (deliveryMarkerRef.current) deliveryMarkerRef.current.remove();
      deliveryMarkerRef.current = L.marker(delivery, {
        icon: L.divIcon({
          html: markerHtml("delivery"),
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
      })
        .addTo(map)
        .bindPopup("Livreur");
    }

    if (routeLineRef.current) routeLineRef.current.remove();
    if (client && delivery) {
      routeLineRef.current = L.polyline([client, delivery], {
        color: "#047857",
        weight: 4,
        opacity: 0.65,
        dashArray: "8 10",
      }).addTo(map);
      map.fitBounds(L.latLngBounds([client, delivery]), {
        padding: [40, 40],
        maxZoom: 15,
      });
    } else {
      map.setView(firstPoint, 13);
    }
  }, [authenticated, trackingData]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const steps = useMemo(
    () => [
      { key: "paid", label: "Payee", icon: CheckCircle2 },
      { key: "preparing", label: "Preparation", icon: Package },
      { key: "shipping", label: "Livraison", icon: Truck },
      { key: "delivered", label: "Livree", icon: MapPin },
    ],
    [],
  );
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === trackingData?.status),
  );

  if (!authenticated) {
    return (
      <div className="min-h-dvh bg-[#f6f7f0] px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center">
          <div className="grid w-full overflow-hidden rounded-3xl border border-[#c2c9bb]/45 bg-white shadow-xl md:grid-cols-[1.1fr_.9fr]">
            <section className="relative hidden min-h-[540px] overflow-hidden bg-[#243420] p-8 text-white md:block">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=90&w=1400&auto=format&fit=crop"
                alt="Livraison de commande"
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#162312] via-[#243420]/80 to-[#31452d]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur">
                  <ShieldCheck className="h-4 w-4" />
                  Suivi securise
                </div>
                <div>
                  <h1 className="max-w-md text-4xl font-black leading-tight">
                    Suivez votre commande en temps reel.
                  </h1>
                  <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                    Entrez l&apos;email utilise lors de la commande pour afficher la
                    position de livraison et les informations de suivi.
                  </p>
                </div>
              </div>
            </section>

            <section className="p-5 sm:p-8">
              <div className="mx-auto max-w-md">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#243420]">
                    <Package className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#72796e]">
                    Commande #{orderNumber}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#191c18]">
                    Acceder au suivi
                  </h2>
                  <p className="mt-2 text-sm text-[#72796e]">
                    Confirmez votre email pour ouvrir la page de tracking.
                  </p>
                </div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#72796e]">
                  Email de commande
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#72796e]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void authenticate();
                    }}
                    className="h-12 w-full rounded-2xl border border-[#c2c9bb]/50 bg-[#f9faf2] pl-12 pr-4 text-sm text-[#191c18] outline-none transition focus:border-[#31452d] focus:ring-4 focus:ring-[#31452d]/10"
                    placeholder="client@exemple.com"
                  />
                </div>

                <button
                  onClick={authenticate}
                  disabled={!email.trim() || loading}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#243420] text-sm font-black text-white shadow-sm transition hover:bg-[#31452d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verification..." : "Suivre ma commande"}
                  <Navigation className="h-4 w-4" />
                </button>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f6f7f0] p-6 text-sm font-semibold text-[#72796e]">
        Chargement du suivi...
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f6f7f0] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="overflow-hidden rounded-3xl border border-[#c2c9bb]/45 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#243420] text-white">
                <Truck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
                  Suivi commande
                </p>
                <h1 className="truncate text-xl font-black text-[#191c18] sm:text-2xl">
                  #{orderNumber}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[520px]">
              <InfoPill
                icon={Package}
                label="Statut"
                value={statusLabel(trackingData.status)}
              />
              <InfoPill
                icon={Clock}
                label="Mise a jour"
                value={
                  lastUpdated
                    ? lastUpdated.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "En attente"
                }
              />
              <InfoPill
                icon={Navigation}
                label="Rafraichissement"
                value="Toutes les 5s"
              />
            </div>
          </div>

          <div className="grid gap-0 border-t border-[#c2c9bb]/35 sm:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const active = index <= currentIndex;
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    active ? "bg-[#eef3ea] text-[#243420]" : "text-[#72796e]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      active ? "bg-[#243420] text-white" : "bg-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Etape {index + 1}
                    </p>
                    <p className="text-sm font-black">{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-3xl border border-[#c2c9bb]/45 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#c2c9bb]/35 px-4 py-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72796e]">
                  Carte livraison
                </p>
                <h2 className="text-lg font-black text-[#191c18]">
                  Position en direct
                </h2>
              </div>
              <span className="rounded-full bg-[#eef3ea] px-3 py-1 text-xs font-bold text-[#243420]">
                Live
              </span>
            </div>
            <div
              ref={mapContainerRef}
              className="h-[420px] w-full bg-[#eef1e8] sm:h-[520px]"
            />
          </section>

          <aside className="space-y-4">
            <LocationCard
              title="Adresse client"
              icon={MapPin}
              color="blue"
              point={trackingData.client}
            />
            <LocationCard
              title="Livreur"
              icon={Truck}
              color="green"
              point={trackingData.delivery}
            />

            <div className="rounded-3xl border border-[#c2c9bb]/45 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72796e]">
                Confidentialite
              </p>
              <div className="mt-3 flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#243420]" />
                <p className="text-sm leading-6 text-[#5c6258]">
                  Le suivi est accessible uniquement avec l&apos;email associe a la
                  commande. Les positions sont mises a jour automatiquement.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .track-pulse {
          animation: trackPulse 1.4s ease-in-out infinite;
        }
        @keyframes trackPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
        .leaflet-container {
          font-family: Inter, system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#c2c9bb]/35 bg-[#f9faf2] px-3 py-2">
      <div className="flex items-center gap-2 text-[#72796e]">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="mt-1 truncate text-sm font-black text-[#191c18]">{value}</p>
    </div>
  );
}

function LocationCard({
  title,
  icon: Icon,
  color,
  point,
}: {
  title: string;
  icon: typeof Truck;
  color: "blue" | "green";
  point?: TrackPoint | null;
}) {
  const latLng = pointToLatLng(point);
  const accent =
    color === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-100";

  return (
    <div className="rounded-3xl border border-[#c2c9bb]/45 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72796e]">
            Position
          </p>
          <h3 className="text-base font-black text-[#191c18]">{title}</h3>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-[#f9faf2] px-4 py-3">
        {latLng ? (
          <p className="text-sm font-semibold text-[#42493e]">
            {latLng[0].toFixed(5)}, {latLng[1].toFixed(5)}
          </p>
        ) : (
          <p className="text-sm font-semibold text-[#72796e]">
            Position indisponible
          </p>
        )}
      </div>
    </div>
  );
}
