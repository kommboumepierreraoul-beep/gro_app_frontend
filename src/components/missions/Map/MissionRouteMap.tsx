/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Navigation } from "lucide-react";

const LeafletRouteMap = dynamic(() => import("./LeafletRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#edefe7]">
      <Loader2 className="animate-spin text-[#154212]" size={24} />
    </div>
  ),
});

interface Props {
  destination: { lat: number; lng: number; label?: string };
}

export default function MissionRouteMap({ destination }: Props) {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPermissionDenied(true),
      { timeout: 5000 },
    );
  }, []);

  if (permissionDenied) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#edefe7] rounded-xl gap-2 p-4 text-center">
        <Navigation size={24} className="text-[#72796e]" />
        <p className="text-xs text-[#72796e]">
          Activez la géolocalisation pour voir l'itinéraire vers cette mission.
        </p>
      </div>
    );
  }

  if (!origin) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#edefe7] rounded-xl">
        <Loader2 className="animate-spin text-[#154212]" size={24} />
      </div>
    );
  }

  return <LeafletRouteMap origin={origin} destination={destination} />;
}

// Calcul de distance à vol d'oiseau (Haversine) pour affichage rapide
export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
