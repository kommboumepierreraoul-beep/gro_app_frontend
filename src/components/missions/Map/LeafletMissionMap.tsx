"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MissionMapPoint } from "@/lib/missions/types";
import { useMissionStore } from "@/stores/useMissionStore";

interface Props {
  center: { lat: number; lng: number };
  radiusKm: number;
  points: MissionMapPoint[];
  onSelectMission?: (point: MissionMapPoint) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onLocate?: () => void;
  isLocating?: boolean;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (center && map) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  return null;
}

function buildCategoryIcon(point: MissionMapPoint): L.DivIcon {
  const color = point.category_color ?? "#154212";
  const initial = (point.category_slug ?? point.title)[0].toUpperCase();

  const html = `
    <div style="
      width: 34px; height: 34px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white; font-weight: 700; font-size: 13px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      ">${initial}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "gro-mission-marker",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function buildUserIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        width: 18px; height: 18px;
        background: #185fa5;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 6px rgba(24,95,165,0.2);
      "></div>
    `,
    className: "gro-user-marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function LeafletMissionMap({
  center,
  radiusKm,
  points,
  onSelectMission,
  onMapClick,
}: Props) {
  const openApplyModal = useMissionStore((s) => s.openApplyModal);
  const userIcon = buildUserIcon();

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={11}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={onMapClick} />
      <RecenterMap center={center} />

      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>Votre position</Popup>
      </Marker>

      <Circle
        center={[center.lat, center.lng]}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#154212",
          fillColor: "#2d5a27",
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: "6 6",
        }}
      />

      {points &&
        points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={buildCategoryIcon(point)}
            eventHandlers={{
              click: () => onSelectMission?.(point),
            }}
          >
            <Popup>
              <div style={{ minWidth: 180, fontFamily: "Inter, sans-serif" }}>
                {point.category_slug && (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "2px 8px",
                      borderRadius: 999,
                      backgroundColor: `${point.category_color}20`,
                      color: point.category_color ?? "#154212",
                      marginBottom: 6,
                    }}
                  >
                    {point.category_slug.replace(/-/g, " ")}
                  </span>
                )}

                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#191c18",
                    margin: "4px 0",
                  }}
                >
                  {point.title}
                </p>

                <p style={{ fontSize: 11, color: "#72796e", margin: "2px 0" }}>
                  📍 {point.distance_km} km · {point.applications_count}{" "}
                  candidature
                  {point.applications_count !== 1 ? "s" : ""}
                </p>

                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <a
                    href={`/missions/${point.ulid}`}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      border: "1px solid #154212",
                      color: "#154212",
                      borderRadius: 8,
                      padding: "6px 0",
                      textDecoration: "none",
                    }}
                  >
                    Détails
                  </a>

                  <button
                    onClick={() => openApplyModal(point.ulid)}
                    style={{
                      flex: 1,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#154212",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 0",
                      cursor: "pointer",
                    }}
                  >
                    Postuler
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
