import { Link } from "react-router-dom";
import { Droplet, Leaf, Sprout } from "lucide-react";

import type { CareTask, Plant, UserPlant } from "@/api/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PlantTile } from "@/components/PlantTile";
import { MoistureRing } from "@/components/MoistureRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCareTasks } from "@/hooks/useCareTasks";
import { usePlants } from "@/hooks/usePlants";
import { useMarkWatered, useUserPlants } from "@/hooks/useUserPlants";
import { useSplash } from "@/hooks/useSplash";
import {
  CARE_STATUS_VARIANT,
  careTypeLabel,
  relativeDue,
  statusLabel,
} from "@/lib/care";

export function MyPlants() {
  const {
    data: userPlants = [],
    isLoading,
    isError,
    refetch,
  } = useUserPlants();
  const { data: plants = [] } = usePlants();
  const { tasks } = useCareTasks();

  const plantById = new Map(plants.map((p) => [p.id, p]));
  const nextTaskByPlant = new Map<string, CareTask>();
  const waterTaskByPlant = new Map<string, CareTask>();
  for (const task of tasks) {
    const current = nextTaskByPlant.get(task.userPlantId);
    if (!current || task.daysUntil < current.daysUntil) {
      nextTaskByPlant.set(task.userPlantId, task);
    }
    if (task.type === "water") waterTaskByPlant.set(task.userPlantId, task);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Мои растения
        </h1>
        <p className="mt-1 text-muted-foreground">
          {userPlants.length > 0
            ? `${userPlants.length} в коллекции. Следим за поливом и пересадкой.`
            : "Личная коллекция ваших растений."}
        </p>
      </header>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-border/70 bg-muted/40"
            />
          ))}
        </div>
      ) : userPlants.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Пока пусто"
          description="Добавьте растения из справочника — и они появятся здесь с напоминаниями по уходу."
          action={
            <Button asChild>
              <Link to="/catalog">
                <Leaf className="size-4" />
                Открыть справочник
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {userPlants.map((up) => (
            <MyPlantCard
              key={up.id}
              userPlant={up}
              plant={plantById.get(up.plantId)}
              task={nextTaskByPlant.get(up.id)}
              waterProgress={waterTaskByPlant.get(up.id)?.progress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyPlantCard({
  userPlant,
  plant,
  task,
  waterProgress,
}: {
  userPlant: UserPlant;
  plant?: Plant;
  task?: CareTask;
  waterProgress?: number;
}) {
  const water = useMarkWatered();
  const [splash, triggerSplash] = useSplash();
  const title = userPlant.nickname || plant?.name || "Растение";
  const hasReminders = userPlant.remindersEnabled;

  function doWater() {
    triggerSplash();
    water.mutate(userPlant.id);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-border">
      <Link to={`/my-plants/${userPlant.id}`} className="shrink-0">
        <MoistureRing
          progress={hasReminders ? waterProgress : undefined}
          size={64}
          splash={splash}
        >
          <PlantTile
            plant={plant ?? { id: userPlant.plantId, name: title }}
            rounded="rounded-full"
            className="h-full w-full"
          />
        </MoistureRing>
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/my-plants/${userPlant.id}`}
          className="block truncate font-display font-bold hover:underline"
        >
          {title}
        </Link>
        {plant?.latinName && (
          <p className="specimen truncate text-xs text-muted-foreground">
            {plant.latinName}
          </p>
        )}
        {task ? (
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant={CARE_STATUS_VARIANT[task.status]}>
              {statusLabel(task.status)}
            </Badge>
            <span className="truncate text-xs text-muted-foreground">
              {careTypeLabel(task.type)} · {relativeDue(task.dueDate)}
            </span>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Напоминания выключены
          </p>
        )}
      </div>

      {task?.type === "water" && (
        <Button
          size="icon"
          variant="secondary"
          aria-label="Отметить полив"
          disabled={water.isPending}
          onClick={doWater}
        >
          <Droplet className="size-4 text-sky-500" />
        </Button>
      )}
    </div>
  );
}
