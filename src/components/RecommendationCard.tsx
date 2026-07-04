import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

import type { Plant } from "@/api/types";
import { PlantTile } from "@/components/PlantTile";

export function RecommendationCard({
  plant,
  reason,
}: {
  plant: Plant;
  reason: string;
}) {
  return (
    <Link
      to={`/catalog/${plant.id}`}
      className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <PlantTile
        plant={plant}
        rounded="rounded-lg"
        className="size-16 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display font-bold leading-tight">
          {plant.name}
        </h3>
        {plant.latinName && (
          <p className="specimen truncate text-xs text-muted-foreground">
            {plant.latinName}
          </p>
        )}
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-primary">
          <Sparkles className="size-3 shrink-0" />
          <span className="truncate">{reason}</span>
        </p>
      </div>
    </Link>
  );
}
