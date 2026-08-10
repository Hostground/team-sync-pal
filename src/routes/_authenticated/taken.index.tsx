import { createFileRoute } from "@tanstack/react-router";
import { ChecklistPanel } from "@/components/ChecklistPanel";

export const Route = createFileRoute("/_authenticated/taken/")({
  head: () => ({
    meta: [
      { title: "Mijn taken — Planning" },
      {
        name: "description",
        content: "Persoonlijke live takenlijst: voeg taken toe, vink af en hergebruik sjablonen.",
      },
      { property: "og:title", content: "Mijn taken — Planning" },
      {
        property: "og:description",
        content: "Persoonlijke live takenlijst met sjablonen, gemaakt voor mobiel gebruik.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TakenPage,
});

function TakenPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mijn taken</h1>
        <p className="text-sm text-muted-foreground">Jouw persoonlijke takenlijst</p>
      </div>
      <ChecklistPanel personal title="Takenlijst" />
    </div>
  );
}
