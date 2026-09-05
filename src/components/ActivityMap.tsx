import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Navigation, Copy } from "lucide-react";
import { toast } from "sonner";
import type { LatLng } from "@/components/map/map-constants";

const MapCore = lazy(() => import("@/components/map/MapCore"));

const Placeholder = () => (
  <div className="h-64 w-full rounded-md border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
    Kaart laden…
  </div>
);

export function ActivityMap({
  point,
  photoPins = [],
  label,
}: {
  point: LatLng;
  photoPins?: Array<LatLng & { title?: string }>;
  label?: string | null;
}) {
  const copy = async () => {
    await navigator.clipboard.writeText(`${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`);
    toast.success("Coördinaten gekopieerd");
  };

  return (
    <div className="space-y-2">
      <ClientOnly fallback={<Placeholder />}>
        <Suspense fallback={<Placeholder />}>
          <MapCore value={point} markers={photoPins} className="h-64 w-full rounded-md" />
        </Suspense>
      </ClientOnly>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation className="h-4 w-4 mr-1" /> Route
          </a>
        </Button>
        <Button size="sm" variant="ghost" onClick={copy}>
          <Copy className="h-4 w-4 mr-1" /> Coördinaten
        </Button>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
