import { useState, type ReactNode } from "react";
import { Sprout } from "lucide-react";
import { toast } from "sonner";

import type { Plant } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { useAddUserPlant } from "@/hooks/useUserPlants";

/**
 * Adds a catalogue plant to the personal collection. Pre-fills care intervals
 * from the catalogue so a beginner can accept sensible defaults, while letting
 * an experienced grower override them per specimen.
 */
export function AddToMyPlantsDialog({
  plant,
  children,
  onAdded,
}: {
  plant: Plant;
  children: ReactNode;
  onAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const add = useAddUserPlant();

  const [nickname, setNickname] = useState("");
  const [notes, setNotes] = useState("");
  const [water, setWater] = useState(
    plant.wateringIntervalDays ? String(plant.wateringIntervalDays) : ""
  );
  const [repot, setRepot] = useState(
    plant.repottingIntervalMonths ? String(plant.repottingIntervalMonths) : ""
  );
  const [reminders, setReminders] = useState(true);

  function submit() {
    add.mutate(
      {
        plantId: plant.id,
        nickname: nickname.trim() || undefined,
        notes: notes.trim() || undefined,
        wateringIntervalDays: water ? Number(water) : undefined,
        repottingIntervalMonths: repot ? Number(repot) : undefined,
        remindersEnabled: reminders,
      },
      {
        onSuccess: () => {
          toast.success(`${nickname.trim() || plant.name} — в вашей коллекции`);
          setOpen(false);
          setNickname("");
          setNotes("");
          onAdded?.();
        },
        onError: () => toast.error("Не удалось добавить растение"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="size-5 text-primary" />
            Добавить в мои растения
          </DialogTitle>
          <DialogDescription>
            {plant.name}
            {plant.latinName ? " · " : ""}
            <span className="specimen">{plant.latinName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nickname">Имя растения (необязательно)</Label>
            <Input
              id="nickname"
              placeholder="Например, «Моня на кухне»"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="water">Полив, дней</Label>
              <Input
                id="water"
                type="number"
                min={1}
                inputMode="numeric"
                value={water}
                onChange={(e) => setWater(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repot">Пересадка, мес.</Label>
              <Input
                id="repot"
                type="number"
                min={1}
                inputMode="numeric"
                value={repot}
                onChange={(e) => setRepot(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              placeholder="Где стоит, особенности, откуда приехало…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5">
            <Label htmlFor="reminders" className="cursor-pointer">
              Напоминать об уходе
            </Label>
            <Switch
              id="reminders"
              checked={reminders}
              onCheckedChange={setReminders}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={add.isPending}
          >
            Отмена
          </Button>
          <Button onClick={submit} disabled={add.isPending}>
            {add.isPending ? "Добавляем…" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
