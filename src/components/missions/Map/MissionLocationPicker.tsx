/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';



delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  latitude?: number;
  longitude?: number;
  locationLabel?: string;

  onChange: (
    lat: number,
    lng: number,
    label: string
  ) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

function MapCenter({
  position,
}: {
  position: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  return null;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (
    lat: number,
    lng: number
  ) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(
        e.latlng.lat,
        e.latlng.lng
      );
    },
  });

  return null;
}

export default function MissionLocationPicker({
  latitude,
  longitude,
  locationLabel,
  onChange,
}: Props) {
  const [query, setQuery] = useState(
    locationLabel || ''
  );

  useEffect(() => {
  // Fix icône Leaflet si besoin
  import('leaflet').then((L) => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
  });
}, []);

  const [loading, setLoading] =
    useState(false);

  const [results, setResults] =
    useState<SearchResult[]>([]);

  const [position, setPosition] =
    useState<[number, number] | null>(
      latitude && longitude
        ? [latitude, longitude]
        : null
    );

  const center: [number, number] =
    position || [3.848, 11.502];

  const reverseGeocode = async (
    lat: number,
    lng: number
  ) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();

      const label =
        [
          data.address?.suburb,
          data.address?.city_district,
          data.address?.village,
          data.address?.town,
          data.address?.city,
        ]
          .filter(Boolean)
          .slice(0, 2)
          .join(', ') ||
        data.display_name ||
        '';

      setQuery(label);

      onChange(
        lat,
        lng,
        label
      );
    } catch {
      onChange(lat, lng, '');
    }
  };

  const handleLocationChange = async (
    lat: number,
    lng: number
  ) => {
    setPosition([lat, lng]);

    await reverseGeocode(
      lat,
      lng
    );
  };

  const searchLocation = async (
    value: string
  ) => {
    setQuery(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&limit=5`
      );

      const data =
        await response.json();

      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = (
    place: SearchResult
  ) => {
    const lat = Number(place.lat);
    const lng = Number(place.lon);

    setPosition([lat, lng]);

    setResults([]);

    setQuery(
      place.display_name
    );

    onChange(
      lat,
      lng,
      place.display_name
    );
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        handleLocationChange(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        alert(
          'Impossible de récupérer votre position'
        );
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={(e) =>
              searchLocation(
                e.target.value
              )
            }
            placeholder="Rechercher un lieu..."
            className="
              w-full
              px-4
              py-3
              rounded-xl
              border
              border-[#c2c9bb]
              bg-white
              text-sm
            "
          />

          {results.length > 0 && (
            <div
              className="
                absolute
                z-[1000]
                w-full
                bg-white
                border
                border-[#c2c9bb]
                rounded-xl
                shadow-lg
                mt-1
                overflow-hidden
              "
            >
              {results.map(
                (place) => (
                  <button
                    key={
                      place.place_id
                    }
                    type="button"
                    onClick={() =>
                      selectPlace(
                        place
                      )
                    }
                    className="
                      w-full
                      text-left
                      px-4
                      py-3
                      text-sm
                      hover:bg-[#f3f4ed]
                    "
                  >
                    {
                      place.display_name
                    }
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={
            useCurrentLocation
          }
          className="
            px-4
            py-3
            bg-[#154212]
            text-white
            rounded-xl
            text-sm
            font-medium
            hover:bg-[#2d5a27]
          "
        >
          Ma position
        </button>
      </div>

      {loading && (
        <p className="text-xs text-[#72796e]">
          Recherche...
        </p>
      )}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-[#c2c9bb]/40
        "
      >
        <MapContainer
          center={center}
          zoom={13}
          style={{
            width: '100%',
            height: '350px',
          }}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenter
            position={position}
          />

          <MapClickHandler
            onLocationSelect={
              handleLocationChange
            }
          />

          {position && (
            <Marker
              position={
                position
              }
              draggable
              eventHandlers={{
                dragend: (
                  e
                ) => {
                  const marker =
                    e.target;

                  const pos =
                    marker.getLatLng();

                  handleLocationChange(
                    pos.lat,
                    pos.lng
                  );
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {position && (
        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <input
            readOnly
            value={
              position[0]
            }
            className="
              px-3
              py-2
              bg-white
              border
              rounded-lg
              text-sm
            "
          />

          <input
            readOnly
            value={
              position[1]
            }
            className="
              px-3
              py-2
              bg-white
              border
              rounded-lg
              text-sm
            "
          />
        </div>
      )}
    </div>
  );
}