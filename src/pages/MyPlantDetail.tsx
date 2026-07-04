import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Droplet,
  Repeat,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { CareTask } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlantTile } from "@/components/PlantTile";
import { MoistureRing } from "@/components/MoistureRing";
import { useCareTasks } from "@/hooks/useCareTasks";
import { usePlant } from "@/hooks/usePlants";
import {
  useMarkRepotted,
  useMarkWatered,
  useRemoveUserPlant,
  useUpdateUserPlant,
  useUserPlant,
} from "@/hooks/useUserPlants";
import {
  careTypeLabel,
  humanDate,
  relativeDue,
  statusLabel,
} from "@/lib/care";
import { cn } from "@/lib/utils";

const STATUS_VARIANT = {
  overdue: "warn",
  "due-today": "orchid",
  upcoming: "secondary",
} as const;

export function MyPlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: userPlant, isLoading } = useUserPlant(id);
  const { data: plant } = usePlant(userPlant?.plantId);
  const { tasks } = useCareTasks();

  const update = useUpdateUserPlant();
  const water = useMarkWatered();
  const repot = useMarkRepotted();
  const remove = useRemoveUserPlant();

  const [notes, setNotes] = useState("");
  const [waterDays, setWaterDays] = useState("");
  const [repotMonths, setRepotMonths] = useState("");
  const [reminders, setReminders] = useState(true);
  const [splash, setSplash] = useState(false);

  useEffect(() => {
    if (!userPlant) return;
    setNotes(userPlant.notes ?? "");
    setWaterDays(
      userPlant.wateringIntervalDays
        ? String(userPlant.wateringIntervalDays)
        : ""
    );
    setRepotMonths(
      userPlant.repottingIntervalMonths
        ? String(userPlant.repottingIntervalMonths)
        : ""
    );
    setReminders(userPlant.remindersEnabled);
  }, [userPlant]);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted/40" />;
  }
  if (!userPlant) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Растение не найдено.</p>
        <Button asChild variant="outline">
          <Link to="/my-plants">
            <ArrowLeft className="size-4" />К моим растениям
          </Link>
        </Button>
      </div>
    );
  }

  const title = userPlant.nickname || plant?.name || "Растение";
  const myTasks = tasks.filter((t) => t.userPlantId === userPlant.id);
  const waterTask = myTasks.find((t) => t.type === "water");
  const repotTask = myTasks.find((t) => t.type === "repot");

  function waterNow() {
    setSplash(true);
    window.setTimeout(() => setSplash(false), 850);
    water.mutate(userPlant!.id, {
      onSuccess: () => toast.success(`${title} полит(а)`),
    });
  }

  function saveSettings() {
    update.mutate(
      {
        id: userPlant!.id,
        patch: {
          notes: notes.trim() || undefined,
          wateringIntervalDays: waterDays ? Number(waterDays) : undefined,
          repottingIntervalMonths: repotMonths
            ? Number(repotMonths)
            : undefined,
          remindersEnabled: reminders,
        },
      },
      { onSuccess: () => toast.success("Изменения сохранены") }
    );
  }

  function toggleReminders(next: boolean) {
    setReminders(next);
    update.mutate({
      id: userPlant!.id,
      patch: { remindersEnabled: next },
    });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/my-plants">
          <ArrowLeft className="size-4" />
          Мои растения
        </Link>
      </Button>

      {/* Identity */}
      <div className="flex items-start gap-4">
        <MoistureRing
          progress={userPlant.remindersEnabled ? waterTask?.progress : undefined}
          size={104}
          splash={splash}
          className="mt-1"
        >
          <PlantTile
            plant={plant ?? { id: userPlant.plantId, name: title }}
            rounded="rounded-full"
            className="h-full w-full"
          />
        </MoistureRing>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
            {title}
          </h1>
          {plant?.latinName && (
            <p className="specimen text-muted-foreground">{plant.latinName}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            В коллекции с {humanDate(userPlant.dateAdded)}
          </p>
          {plant && (
            <Button asChild variant="link" size="sm" className="-ml-3 mt-1">
              <Link to={`/catalog/${plant.id}`}>
                <BookOpen className="size-4" />
                Открыть карточку в справочнике
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Care actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <CareAction
          icon={<Droplet className="size-5 text-sky-500" />}
          title="Полив"
          task={waterTask}
          last={userPlant.lastWateredAt}
          actionLabel="Полил"
          pending={water.isPending}
          onAction={waterNow}
        />
        <CareAction
          icon={<Repeat className="size-5 text-primary" />}
          title="Пересадка"
          task={repotTask}
          last={userPlant.lastRepottedAt}
          actionLabel="Пересадил"
          pending={repot.isPending}
          onAction={() =>
            repot.mutate(userPlant.id, {
              onSuccess: () => toast.success(`${title} пересажен(а)`),
            })
          }
        />
      </div>

      {/* Care settings */}
      <section className="rounded-xl border border-border/70 bg-card p-5">
        <h2 className="font-display text-lg font-bold">Настройки ухода</h2>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5">
          <Label htmlFor="reminders">Напоминать об уходе</Label>
          <Switch
            id="reminders"
            checked={reminders}
            onCheckedChange={toggleReminders}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="waterDays">Полив, дней</Label>
            <Input
              id="waterDays"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder={
                plant?.wateringIntervalDays
                  ? String(plant.wateringIntervalDays)
                  : "—"
              }
              value={waterDays}
              onChange={(e) => setWaterDays(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repotMonths">Пересадка, мес.</Label>
            <Input
              id="repotMonths"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder={
                plant?.repottingIntervalMonths
                  ? String(plant.repottingIntervalMonths)
                  : "—"
              }
              value={repotMonths}
              onChange={(e) => setRepotMonths(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="notes">Заметки</Label>
          <Textarea
            id="notes"
            placeholder="Где стоит, чем подкармливаете, наблюдения…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={saveSettings} disabled={update.isPending}>
            {update.isPending ? "Сохраняем…" : "Сохранить"}
          </Button>
        </div>
      </section>

      {/* Danger zone */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
            <Trash2 className="size-4" />
            Удалить из коллекции
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить «{title}»?</DialogTitle>
            <DialogDescription>
              Растение исчезнет из вашей коллекции вместе с заметками и
              напоминаниями. Карточка в справочнике останется.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Отмена</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(userPlant.id, {
                  onSuccess: () => {
                    toast.success("Растение удалено");
                    navigate("/my-plants");
                  },
                })
              }
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CareAction({
  icon,
  title,
  task,
  last,
  actionLabel,
  pending,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  task?: CareTask;
  last?: string;
  actionLabel: string;
  pending: boolean;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary">
            {icon}
          </span>
          <h3 className="font-display text-base font-bold">{title}</h3>
        </div>
        {task && (
          <Badge variant={STATUS_VARIANT[task.status]}>
            {statusLabel(task.status)}
          </Badge>
        )}
      </div>

      <p className={cn("mt-3 text-sm", task ? "text-foreground/90" : "text-muted-foreground")}>
        {task ? (
          <>
            {careTypeLabel(task.type)} {relativeDue(task.dueDate)}
          </>
        ) : (
          "Напоминание выключено"
        )}
      </p>
      {last && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          Последний раз: {humanDate(last)}
        </p>
      )}

      <Button
        className="mt-3 w-full"
        variant="secondary"
        disabled={pending}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
