import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Repeat2 } from "lucide-react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlants } from "@/hooks/usePlants";
import { useCreateListing } from "@/hooks/useExchange";

export function CreateListingDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: plants = [] } = usePlants();
  const create = useCreateListing();
  const navigate = useNavigate();

  const [plantId, setPlantId] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [wants, setWants] = useState("");
  const [city, setCity] = useState("");

  const valid = plantId && condition.trim() && wants.trim();

  function reset() {
    setPlantId("");
    setCondition("");
    setDescription("");
    setWants("");
    setCity("");
  }

  function submit() {
    if (!valid) return;
    create.mutate(
      {
        plantId,
        condition,
        description: description || undefined,
        wants,
        city: city || undefined,
      },
      {
        onSuccess: (listing) => {
          toast.success("Объявление размещено");
          setOpen(false);
          reset();
          navigate(`/exchange/${listing.id}`);
        },
        onError: () => toast.error("Не удалось разместить объявление"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat2 className="size-5 text-primary" />
            Разместить растение
          </DialogTitle>
          <DialogDescription>
            Расскажите, что предлагаете и что хотите взамен.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plant">Растение</Label>
            <Select value={plantId} onValueChange={setPlantId}>
              <SelectTrigger id="plant" aria-label="Выберите растение">
                <SelectValue placeholder="Выберите из справочника" />
              </SelectTrigger>
              <SelectContent>
                {plants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="condition">Состояние и размер</Label>
            <Input
              id="condition"
              placeholder="Например, «Укоренённый черенок, 2 листа»"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wants">Что хотите взамен</Label>
            <Input
              id="wants"
              placeholder="Например, «Любой суккулент или калатею»"
              value={wants}
              onChange={(e) => setWants(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                placeholder="Особенности, история растения…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                className="w-36"
                placeholder="Москва"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={create.isPending}
          >
            Отмена
          </Button>
          <Button onClick={submit} disabled={!valid || create.isPending}>
            {create.isPending ? "Размещаем…" : "Разместить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
