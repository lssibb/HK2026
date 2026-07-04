import { Link } from "react-router-dom";
import { MapPin, Repeat2 } from "lucide-react";

import type { ExchangeListing, Plant } from "@/api/types";
import { ME_ID } from "@/api/types";
import { PlantTile } from "@/components/PlantTile";
import { Badge } from "@/components/ui/badge";
import {
  EXCHANGE_STATUS_VARIANT,
  exchangeStatusLabel,
  relativeDue,
} from "@/lib/care";

export function ExchangeCard({
  listing,
  plant,
}: {
  listing: ExchangeListing;
  plant?: Plant;
}) {
  const mine = listing.ownerId === ME_ID;

  return (
    <Link
      to={`/exchange/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5"
    >
      <div className="relative aspect-[5/3] w-full">
        <PlantTile
          plant={plant ?? { id: listing.plantId, name: "Растение" }}
          rounded="rounded-none"
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <Badge variant={EXCHANGE_STATUS_VARIANT[listing.status]}>
            {exchangeStatusLabel(listing.status)}
          </Badge>
          {mine && <Badge variant="orchid">Моё</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight">
            {plant?.name ?? "Растение"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {listing.ownerName}
            {listing.city ? (
              <>
                {" · "}
                <MapPin className="inline size-3 -translate-y-px" />{" "}
                {listing.city}
              </>
            ) : null}
          </p>
        </div>

        <p className="flex items-start gap-1.5 text-sm text-foreground/90">
          <Repeat2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="line-clamp-2">{listing.wants}</span>
        </p>

        <p className="mt-auto text-xs text-muted-foreground">
          {relativeDue(listing.createdAt)}
        </p>
      </div>
    </Link>
  );
}
