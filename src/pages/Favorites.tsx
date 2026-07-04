import { Link } from "react-router-dom";
import { Heart, Leaf } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlants } from "@/hooks/usePlants";

export function Favorites() {
  const plantsQ = usePlants();
  const favoritesQ = useFavorites();
  const plants = plantsQ.data ?? [];
  const favorites = favoritesQ.data ?? [];

  const favSet = new Set(favorites);
  const favPlants = plants.filter((p) => favSet.has(p.id));
  const isError = plantsQ.isError || favoritesQ.isError;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Избранное
        </h1>
        <p className="mt-1 text-muted-foreground">
          Растения, которые вы отметили сердечком в справочнике.
        </p>
      </header>

      {isError ? (
        <ErrorState
          onRetry={() => {
            plantsQ.refetch();
            favoritesQ.refetch();
          }}
        />
      ) : favPlants.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Здесь пока пусто"
          description="Отмечайте понравившиеся растения в справочнике — они соберутся здесь."
          action={
            <Button asChild>
              <Link to="/catalog">
                <Leaf className="size-4" />
                В справочник
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}
