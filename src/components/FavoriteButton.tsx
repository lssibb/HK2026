import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

/** Heart toggle for the catalogue. Shares state via TanStack Query cache. */
export function FavoriteButton({
  plantId,
  plantName,
  className,
}: {
  plantId: string;
  plantName?: string;
  className?: string;
}) {
  const { data: favorites = [] } = useFavorites();
  const toggle = useToggleFavorite();
  const isFav = favorites.includes(plantId);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-pressed={isFav}
      aria-label={isFav ? "Убрать из избранного" : "В избранное"}
      className={cn(
        "rounded-full backdrop-blur-sm",
        isFav
          ? "text-orchid hover:text-orchid"
          : "text-muted-foreground hover:text-orchid",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !isFav;
        toggle.mutate(
          { plantId, next },
          {
            onSuccess: () =>
              toast(
                next
                  ? `${plantName ?? "Растение"} — в избранном`
                  : "Убрано из избранного"
              ),
          }
        );
      }}
    >
      <Heart className={cn("size-4.5", isFav && "fill-current")} />
    </Button>
  );
}
