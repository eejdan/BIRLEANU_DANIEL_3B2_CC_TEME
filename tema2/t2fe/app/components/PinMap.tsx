"use client";

import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

type PinMapProps = {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
};

const defaultCenter: [number, number] = [44.4268, 26.1025];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function PinMap({ lat, lng, onPick }: PinMapProps) {
  const center = useMemo<[number, number]>(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      return [lat, lng];
    }
    return defaultCenter;
  }, [lat, lng]);

  return (
    <MapContainer center={center} zoom={13} className="pin-map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickPicker onPick={onPick} />
      {typeof lat === "number" && typeof lng === "number" ? <Marker position={[lat, lng]} /> : null}
    </MapContainer>
  );
}
