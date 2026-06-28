/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// ✅ Importer dynamiquement react-leaflet avec ssr: false
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Configuration des icônes Leaflet (côté client uniquement)
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface Props {
  missionTitle: string;
  missionLat: number;
  missionLng: number;
}

export default function MissionDetailMap({
  missionTitle,
  missionLat,
  missionLng,
}: Props) {
  const [isClient, setIsClient] = useState(false);
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ✅ Vérifier que nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getMyLocation = () => {
    if (typeof navigator === "undefined") return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        alert("Impossible d'obtenir votre position.");
      },
    );
  };

  const openGoogleMaps = () => {
    if (typeof window === "undefined") return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${missionLat},${missionLng}`,
      "_blank",
    );
  };

  const distance = userPosition
    ? Math.round(
        Math.sqrt(
          Math.pow(missionLat - userPosition.lat, 2) +
            Math.pow(missionLng - userPosition.lng, 2),
        ) * 111,
      )
    : null;

  // ✅ Rendu du skeleton pendant le SSR
  if (!isClient) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#191c18]">Localisation</h4>
          <div className="flex gap-2">
            <div className="px-3 py-2 rounded-lg text-xs font-medium bg-[#e7e9e1] text-transparent animate-pulse w-24">
              Chargement...
            </div>
            <div className="px-3 py-2 rounded-lg text-xs font-medium border border-[#e7e9e1] text-transparent animate-pulse w-24">
              Chargement...
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-[#c2c9bb]/30 bg-[#e7e9e1] animate-pulse h-[320px] flex items-center justify-center">
          <p className="text-[#72796e]">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-[#191c18]">Localisation</h4>

        <div className="flex gap-2">
          <button
            onClick={getMyLocation}
            className="
              px-3 py-2
              rounded-lg
              text-xs
              font-medium
              bg-[#154212]
              text-white
              hover:bg-[#2d5a27]
              transition-colors
            "
          >
            Ma position
          </button>

          <button
            onClick={openGoogleMaps}
            className="
              px-3 py-2
              rounded-lg
              text-xs
              font-medium
              border
              border-[#154212]
              text-[#154212]
              hover:bg-[#154212]
              hover:text-white
              transition-colors
            "
          >
            Itinéraire
          </button>
        </div>
      </div>

      {distance && (
        <div className="text-xs text-[#3b6934] font-semibold">
          Distance estimée : {distance} km
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-[#c2c9bb]/30">
        {isClient && (
          <MapContainer
            center={[missionLat, missionLng]}
            zoom={14}
            style={{
              width: "100%",
              height: "320px",
            }}
          >
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={[missionLat, missionLng]}>
              <Popup>{missionTitle}</Popup>
            </Marker>

            {userPosition && (
              <>
                <Marker position={[userPosition.lat, userPosition.lng]}>
                  <Popup>Votre position</Popup>
                </Marker>

                <Polyline
                  positions={[
                    [userPosition.lat, userPosition.lng],
                    [missionLat, missionLng],
                  ]}
                />
              </>
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
