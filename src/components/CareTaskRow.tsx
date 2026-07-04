import { useState } from "react";
import { Link } from "react-router-dom";
import { Droplet, Sprout } from "lucide-react";
import { toast } from "sonner";

import type { CareTask, Plant } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlantTile } from "@/components/PlantTile";
import { MoistureRing } from "@/components/MoistureRing";
import { useMarkRepotted, useMarkWatered } from "@/hooks/useUserPlants";
import { careTypeLabel, relativeDue, statusLabel } from "@/lib/care";
import { cn } from "@/lib/utils";

const STATUS_VARIANT = {
  overdue: "warn",
  "due-today": "orchid",
  upcoming: "secondary",
} as const;

export function CareTaskRow({
  task,
  plant,
}: {
  task: CareTask;
  plant?: Plant;
}) {
  const water = useMarkWatered();
  const repot = useMarkRepotted();
  const mutation = task.type === "water" ? water : repot;
  const Icon = task.type === "water" ? Droplet : Sprout;
  const isWater = task.type === "water";
  const [splash, setSplash] = useState(false);

  function done() {
    if (isWater) {
      setSplash(true);
      window.setTimeout(() => setSplash(false), 850);
    }
    mutation.mutate(task.userPlantId, {
      onSuccess: () =>
        toast.success(
          isWater
            ? `${task.plantName} полит(а)`
            : `${task.plantName} пересажен(а)`,
          { description: "Следующее напоминание уже запланировано." }
        ),
    });
  }

  const tile = (
    <PlantTile
      plant={plant ?? { id: task.plantId, name: task.plantName }}
      rounded={isWater ? "rounded-full" : "rounded-xl"}
      className="h-full w-full"
    />
  );

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-2.5 pr-3 transition-colors hover:border-border">
      <Link to={`/my-plants/${task.userPlantId}`} className="shrink-0">
        {isWater ? (
          <MoistureRing progress={task.progress} size={48} splash={splash}>
            {tile}
          </MoistureRing>
        ) : (
          <div className="size-12">{tile}</div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/my-plants/${task.userPlantId}`}
          className="block truncate font-medium hover:underline"
        >
          {task.plantName}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon
            className={cn(
              "size-3.5",
              task.type === "water" ? "text-sky-500" : "text-primary"
            )}
          />
          <span>{careTypeLabel(task.type)}</span>
          <span aria-hidden>·</span>
          <span>{relativeDue(task.dueDate)}</span>
        </div>
      </div>

      <Badge variant={STATUS_VARIANT[task.status]} className="hidden sm:flex">
        {statusLabel(task.status)}
      </Badge>

      <Button
        size="sm"
        variant={task.type === "water" ? "default" : "secondary"}
        disabled={mutation.isPending}
        onClick={done}
      >
        {task.type === "water" ? "Полил" : "Пересадил"}
      </Button>
    </div>
  );
}
