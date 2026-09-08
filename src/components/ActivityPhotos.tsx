import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listActivityPhotos,
  createPhotoUploadUrl,
  registerActivityPhoto,
  deleteActivityPhoto,
} from "@/lib/photos.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, MapPin, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export type ActivityPhoto = {
  id: string;
  url: string | null;
  caption: string | null;
  lat: number | null;
  lng: number | null;
  taken_at: string | null;
  uploaded_by: string;
};

function getPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    let done = false;
    const finish = (v: { lat: number; lng: number } | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    const timer = setTimeout(() => finish(null), 9000);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        clearTimeout(timer);
        finish({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        finish(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}

function uploadWithProgress(
  file: File,
  url: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      } else {
        onProgress(50);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload mislukt (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Netwerkfout bij uploaden"));
    xhr.onabort = () => reject(new Error("Upload geannuleerd"));
    xhr.send(file);
  });
}

export function ActivityPhotos({
  activityId,
  canEdit,
  currentUserId,
  isStaffUser,
  onPhotosChange,
}: {
  activityId: string;
  canEdit: boolean;
  currentUserId?: string;
  isStaffUser?: boolean;
  onPhotosChange?: (photos: ActivityPhoto[]) => void;
}) {
  const list = useServerFn(listActivityPhotos);
  const makeUrl = useServerFn(createPhotoUploadUrl);
  const register = useServerFn(registerActivityPhoto);
  const remove = useServerFn(deleteActivityPhoto);

  const [withLocation, setWithLocation] = useState(true);
  const [busy, setBusy] = useState(0);
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState<ActivityPhoto | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const { data: photos = [], refetch } = useQuery<ActivityPhoto[]>({
    queryKey: ["activity-photos", activityId],
    queryFn: async () => {
      const rows = (await list({ data: { activity_id: activityId } })) as ActivityPhoto[];
      onPhotosChange?.(rows);
      return rows;
    },
  });

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(files.length);
    setProgress(0);
    const pos = withLocation ? await getPosition() : null;
    if (withLocation && !pos) toast.info("Locatie niet beschikbaar – foto wordt zonder locatie bewaard");
    let ok = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (!file.type.startsWith("image/")) throw new Error("Alleen afbeeldingen");
        const { path, signedUrl } = await makeUrl({
          data: { activity_id: activityId, filename: file.name },
        });
        await uploadWithProgress(file, signedUrl, (pct) => {
          setProgress(Math.round(((i + pct / 100) / files.length) * 100));
        });
        await register({
          data: {
            activity_id: activityId,
            storage_path: path,
            lat: pos?.lat ?? null,
            lng: pos?.lng ?? null,
            taken_at: new Date(file.lastModified || Date.now()).toISOString(),
          },
        });
        ok++;
      } catch (e: any) {
        toast.error(e.message ?? "Uploaden mislukt");
      } finally {
        setBusy((b) => b - 1);
      }
    }

    setProgress(0);
    if (ok > 0) {
      toast.success(ok === 1 ? "Foto toegevoegd" : `${ok} foto's toegevoegd`);
      refetch();
    }
  };

  const del = async (p: ActivityPhoto) => {
    try {
      await remove({ data: { photo_id: p.id } });
      toast.success("Foto verwijderd");
      setZoom(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Verwijderen mislukt");
    }
  };

  const mayDelete = (p: ActivityPhoto) => canEdit && (isStaffUser || p.uploaded_by === currentUserId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ImagePlus className="h-4 w-4" /> Foto's{photos.length > 0 && ` (${photos.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {canEdit && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => cameraRef.current?.click()} disabled={busy > 0}>
                <Camera className="h-4 w-4 mr-1" /> Camera
              </Button>
              <Button type="button" variant="outline" onClick={() => galleryRef.current?.click()} disabled={busy > 0}>
                <ImagePlus className="h-4 w-4 mr-1" /> Galerij
              </Button>
            </div>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                upload(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                upload(e.target.files);
                e.target.value = "";
              }}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={withLocation}
                onChange={(e) => setWithLocation(e.target.checked)}
              />
              Locatie meesturen met de foto
            </label>
            {busy > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Uploaden… {progress}%</p>
              </div>
            )}
          </>
        )}

        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen foto's.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setZoom(p)}
                className="relative aspect-square overflow-hidden rounded-md border"
              >
                {p.url && <img src={p.url} alt={p.caption ?? "Foto bij activiteit"} loading="lazy" className="h-full w-full object-cover" />}
                {p.lat != null && p.lng != null && (
                  <span className="absolute bottom-1 right-1 rounded bg-background/80 p-0.5">
                    <MapPin className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>

      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          {zoom.url && <img src={zoom.url} alt={zoom.caption ?? "Foto"} className="max-h-[80vh] max-w-full rounded" />}
          <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {zoom.taken_at && (
              <span className="text-xs text-white/80">
                {format(new Date(zoom.taken_at), "d MMM yyyy HH:mm", { locale: nl })}
              </span>
            )}
            {zoom.lat != null && zoom.lng != null && (
              <Button asChild size="sm" variant="secondary">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${zoom.lat}&mlon=${zoom.lng}#map=17/${zoom.lat}/${zoom.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="h-4 w-4 mr-1" /> Op kaart
                </a>
              </Button>
            )}
            {mayDelete(zoom) && (
              <Button size="sm" variant="destructive" onClick={() => del(zoom)}>
                <Trash2 className="h-4 w-4 mr-1" /> Verwijderen
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-white" onClick={() => setZoom(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
