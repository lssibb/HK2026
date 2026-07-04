import { Link } from "react-router-dom";

import type { Plant } from "@/api/types";
import { CareSpecStrip } from "@/components/CareSpec";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PlantTile } from "@/components/PlantTile";
import { cn } from "@/lib/utils";

export function PlantCard({
  plant,
  className,
}: {
  plant: Plant;
  className?: string;
}) {
  return (
    // Favourite button is a sibling of the link, not nested inside the anchor
    // (a <button> inside an <a> is invalid and hurts keyboard/AT semantics).
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5",
        className
      )}
    >
      <Link
        to={`/catalog/${plant.id}`}
        className="flex flex-1 flex-col outline-none"
      >
        <div className="relative aspect-[5/3] w-full">
          <PlantTile
            plant={plant}
            rounded="rounded-none"
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 className="font-display text-lg font-bold leading-tight">
              {plant.name}
            </h3>
            {plant.latinName && (
              <p className="specimen text-sm text-muted-foreground">
                {plant.latinName}
              </p>
            )}
          </div>
          <CareSpecStrip plant={plant} className="mt-auto" />
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <FavoriteButton
          plantId={plant.id}
          plantName={plant.name}
          className="bg-card/70 hover:bg-card"
        />
      </div>
    </div>
  );
}
