import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Crosshair, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_CENTER, type LatLng } from "@/components/map/map-constants";

const MapCore = lazy(() => import("@/components/map/MapCore"));

const Placeholder = () => (
  <div className="h-64 w-full rounded-md border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
    Kaart laden…
  </div>
);

export function LocationPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (p: LatLng | null) => void;
}) {
  const [flyTo, setFlyTo] = useState<LatLng | null>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Locatie niet beschikbaar op dit toestel");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(p);
        setFlyTo(p);
        toast.success("Pin op je huidige locatie gezet");
      },
      () => toast.error("Kon je locatie niet ophalen"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <Label>Locatie op de kaart</Label>
      <p className="text-xs text-muted-foreground">
        Tik op de kaart om een pin te zetten. Je kan de pin ook verslepen.
      </p>
      <ClientOnly fallback={<Placeholder />}>
        <Suspense fallback={<Placeholder />}>
          <MapCore value={value ?? null} onChange={onChange} flyTo={flyTo} />
        </Suspense>
      </ClientOnly>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
          <Crosshair className="h-4 w-4 mr-1" /> Mijn huidige locatie
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onChange(DEFAULT_CENTER);
            setFlyTo(DEFAULT_CENTER);
          }}
        >
          <MapPin className="h-4 w-4 mr-1" /> Vaste werkplek
        </Button>
        {value && (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="h-4 w-4 mr-1" /> Pin wissen
            </Button>
            <span className="text-xs text-muted-foreground">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
