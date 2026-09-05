import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";

export type LatLng = { lat: number; lng: number };

/** Standaardlocatie: vaste werkplek (Riemst). */
export const DEFAULT_CENTER: LatLng = { lat: 50.7857, lng: 5.0233 };
export const DEFAULT_ZOOM = 16;

const pinIcon = (color: string) =>
  L.divIcon({
    className: "",
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    html: `<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.2 13 25 13 25s13-15.8 13-25C26 5.8 20.2 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>`,
  });

const mainIcon = pinIcon("#dc2626");
const photoIcon = pinIcon("#2563eb");

function ClickCatcher({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ point, zoom }: { point: LatLng; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([point.lat, point.lng], zoom ?? map.getZoom());
  }, [point.lat, point.lng, zoom, map]);
  return null;
}

export type MapCoreProps = {
  /** Hoofdpin (activiteitslocatie). */
  value?: LatLng | null;
  /** Als gezet: klikken/slepen past de pin aan. */
  onChange?: (p: LatLng) => void;
  /** Extra pins, bv. locaties van foto's. */
  markers?: Array<LatLng & { title?: string }>;
  /** Recenter wanneer deze waarde verandert. */
  flyTo?: LatLng | null;
  className?: string;
};

export default function MapCore({ value, onChange, markers = [], flyTo, className }: MapCoreProps) {
  const center = value ?? DEFAULT_CENTER;
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className={className ?? "h-64 w-full rounded-md"}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {onChange && <ClickCatcher onPick={onChange} />}
      {flyTo && <Recenter point={flyTo} zoom={17} />}
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={mainIcon}
          draggable={!!onChange}
          eventHandlers={
            onChange
              ? {
                  dragend: (e) => {
                    const p = (e.target as L.Marker).getLatLng();
                    onChange({ lat: p.lat, lng: p.lng });
                  },
                }
              : undefined
          }
        />
      )}
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng]} icon={photoIcon} title={m.title} />
      ))}
    </MapContainer>
  );
}
