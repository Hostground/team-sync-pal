import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getDisplayByCode } from "@/lib/display.functions";
import { SlideShow } from "@/components/display/SlideShow";

export const Route = createFileRoute("/display/$code")({
  head: () => ({
    meta: [
      { title: "Infoscherm — Lobby" },
      { name: "description", content: "Infoscherm voor de inkomhal met actuele info, foto's, tijd en datum." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Infoscherm — Lobby" },
      { property: "og:description", content: "Infoscherm voor de inkomhal met actuele info, foto's, tijd en datum." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DisplayScreen,
});

function DisplayScreen() {
  const { code } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["display", code],
    queryFn: () => getDisplayByCode({ data: { code } }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-[#0b1220] text-white/60" />;
  }

  if (!data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b1220] text-center text-white/80">
        <div>
          <h1 className="text-3xl font-semibold">Infoscherm niet gevonden</h1>
          <p className="mt-2 opacity-70">Controleer de link of vraag een nieuwe code aan.</p>
        </div>
      </div>
    );
  }

  return <SlideShow data={data} />;
}
