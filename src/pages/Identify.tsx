import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import type { Plant, RecognitionCandidate } from "@/api/types";
import { AddToMyPlantsDialog } from "@/components/AddToMyPlantsDialog";
import { PlantTile } from "@/components/PlantTile";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePlants } from "@/hooks/usePlants";
import { useRecognize } from "@/hooks/useRecognize";
import { cn } from "@/lib/utils";

export function Identify() {
  const { data: plants = [] } = usePlants();
  const plantById = new Map(plants.map((p) => [p.id, p]));
  const recognize = useRecognize();

  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    recognize.reset();
    recognize.mutate(file);
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    recognize.reset();
    if (inputRef.current) inputRef.current.value = "";
  }

  const candidates = recognize.data ?? [];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/catalog">
          <ArrowLeft className="size-4" />
          Справочник
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Определить по фото
        </h1>
        <p className="mt-1 text-muted-foreground">
          Загрузите фото растения — подскажем, что это, и покажем карточку ухода.
        </p>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onSelect}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 px-6 py-16 text-center transition-colors hover:border-primary/60 hover:bg-muted/40 focus-visible:border-primary/60 outline-none"
        >
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
            <Camera className="size-7" />
          </span>
          <span className="font-display text-xl font-bold">
            Загрузите или снимите фото
          </span>
          <span className="mt-1.5 block max-w-sm text-sm text-muted-foreground">
            Поддерживаются JPG, PNG, WebP. На телефоне можно снять камерой.
          </span>
          <span className={cn(buttonVariants(), "mt-5")}>
            <Camera className="size-4" />
            Выбрать фото
          </span>
        </button>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_1.1fr]">
          {/* Preview */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <img
                src={preview}
                alt="Загруженное фото"
                className="aspect-square w-full object-cover"
              />
            </div>
            <Button variant="outline" className="w-full" onClick={reset}>
              <RefreshCw className="size-4" />
              Другое фото
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {recognize.isPending ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-border/70 bg-card text-center">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="mt-3 font-medium">Определяем растение…</p>
                <p className="text-sm text-muted-foreground">
                  Анализируем изображение
                </p>
              </div>
            ) : recognize.isError ? (
              <div className="rounded-2xl border border-border/70 bg-card p-6 text-center">
                <p className="font-medium">Не удалось распознать</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Попробуйте другое фото — получше освещённое и без лишних
                  предметов.
                </p>
              </div>
            ) : (
              <>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                  <Sparkles className="size-5 text-orchid" />
                  Возможно, это…
                </h2>
                {candidates.map((c, i) => {
                  const plant = plantById.get(c.plantId);
                  if (!plant) return null;
                  return (
                    <CandidateCard
                      key={c.plantId}
                      plant={plant}
                      candidate={c}
                      top={i === 0}
                    />
                  );
                })}

                <p className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  В демо-версии распознавание приблизительное и работает по
                  изображению на устройстве. Точную модель можно подключить на
                  бэкенде.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  plant,
  candidate,
  top,
}: {
  plant: Plant;
  candidate: RecognitionCandidate;
  top: boolean;
}) {
  const pct = Math.round(candidate.confidence * 100);
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3",
        top ? "border-primary/40 shadow-sm" : "border-border/70"
      )}
    >
      <div className="flex items-center gap-3">
        <PlantTile
          plant={plant}
          rounded="rounded-lg"
          className="size-16 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display font-bold">{plant.name}</h3>
            <span className="shrink-0 text-xs font-semibold text-primary">
              {pct}%
            </span>
          </div>
          {plant.latinName && (
            <p className="specimen truncate text-xs text-muted-foreground">
              {plant.latinName}
            </p>
          )}
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", top ? "bg-primary" : "bg-living")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/catalog/${plant.id}`}>Открыть карточку</Link>
        </Button>
        <AddToMyPlantsDialog plant={plant}>
          <Button size="sm" className="flex-1">
            <Plus className="size-4" />В мои растения
          </Button>
        </AddToMyPlantsDialog>
      </div>
    </div>
  );
}
