/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  missionTitle: string;
  missionLat: number;
  missionLng: number;
}

export default function MissionMap({
  missionTitle,
  missionLat,
  missionLng,
}: Props) {
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const getMyLocation = () => {
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
      </div>
    </div>
  );
}
