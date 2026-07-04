import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Droplet,
  Info,
  Plus,
  Repeat,
  ShieldAlert,
  ShieldCheck,
  Sun,
} from "lucide-react";
import type { ReactNode } from "react";

import { AddToMyPlantsDialog } from "@/components/AddToMyPlantsDialog";
import { ErrorState } from "@/components/ErrorState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LightArc } from "@/components/CareSpec";
import { PlantTile } from "@/components/PlantTile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlant } from "@/hooks/usePlants";
import {
  LIGHT_LABEL,
  repotCadence,
  wateringCadence,
} from "@/lib/care";

export function PlantDetail() {
  const { id } = useParams();
  const { data: plant, isLoading, isError, refetch } = usePlant(id);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted/40" />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!plant) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Растение не найдено.</p>
        <Button asChild variant="outline">
          <Link to="/catalog">
            <ArrowLeft className="size-4" />В справочник
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/catalog">
          <ArrowLeft className="size-4" />
          Справочник
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        {/* Identity */}
        <div className="space-y-4">
          <div className="relative">
            <PlantTile
              plant={plant}
              rounded="rounded-2xl"
              className="aspect-square w-full"
            />
            <FavoriteButton
              plantId={plant.id}
              plantName={plant.name}
              className="absolute right-3 top-3 bg-card/80 hover:bg-card"
            />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold leading-tight">
              {plant.name}
            </h1>
            {plant.latinName && (
              <p className="specimen text-lg text-muted-foreground">
                {plant.latinName}
              </p>
            )}
          </div>

          <AddToMyPlantsDialog plant={plant}>
            <Button size="lg" className="w-full">
              <Plus className="size-4" />
              Добавить в мои растения
            </Button>
          </AddToMyPlantsDialog>

          {plant.tags && plant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plant.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Care spec sheet */}
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold">Паспорт ухода</h2>

          <CareRow
            icon={<Droplet className="size-5 text-sky-500" />}
            title="Полив"
            badge={wateringCadence(plant.wateringIntervalDays)}
          >
            {plant.watering}
          </CareRow>

          <CareRow
            icon={<Sun className="size-5 text-warn" />}
            title="Освещение"
            badge={
              <span className="flex items-center gap-2">
                <LightArc light={plant.light} className="text-muted-foreground" />
                {LIGHT_LABEL[plant.light]}
              </span>
            }
          >
            {plant.lightNote ?? "Подберите место по уровню освещённости."}
          </CareRow>

          <CareRow
            icon={<Repeat className="size-5 text-primary" />}
            title="Пересадка"
            badge={repotCadence(plant.repottingIntervalMonths)}
          >
            {plant.repotting}
          </CareRow>

          <CareRow
            icon={
              plant.toxic ? (
                <ShieldAlert className="size-5 text-warn" />
              ) : (
                <ShieldCheck className="size-5 text-living" />
              )
            }
            title="Ядовитость"
            badge={
              plant.toxic ? (
                <Badge variant="warn">Токсично</Badge>
              ) : (
                <Badge variant="living">Безопасно</Badge>
              )
            }
          >
            {plant.toxicityNote ??
              (plant.toxic
                ? "Держите вне доступа детей и питомцев."
                : "Считается безопасным для людей и питомцев.")}
          </CareRow>

          {plant.features && plant.features.length > 0 && (
            <CareRow
              icon={<Info className="size-5 text-primary" />}
              title="Особенности ухода"
            >
              <ul className="list-disc space-y-1 pl-4">
                {plant.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </CareRow>
          )}
        </div>
      </div>
    </div>
  );
}

function CareRow({
  icon,
  title,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary">
            {icon}
          </span>
          <h3 className="font-display text-base font-bold">{title}</h3>
        </div>
        {typeof badge === "string" ? (
          <span className="text-sm font-medium text-muted-foreground">
            {badge}
          </span>
        ) : (
          badge
        )}
      </div>
      <div className="mt-3 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </div>
  );
}
