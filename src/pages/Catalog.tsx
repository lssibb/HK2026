import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Search, SlidersHorizontal, Sprout } from "lucide-react";

import type { Light } from "@/api/types";
import { LIGHT_LEVELS } from "@/api/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PlantCard } from "@/components/PlantCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePlants } from "@/hooks/usePlants";
import { LIGHT_LABEL } from "@/lib/care";

type SafeFilter = "all" | "safe";

export function Catalog() {
  const { data: plants = [], isLoading, isError, refetch } = usePlants();
  const [query, setQuery] = useState("");
  const [light, setLight] = useState<Light | "any">("any");
  const [safe, setSafe] = useState<SafeFilter>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (light !== "any" && p.light !== light) return false;
      if (safe === "safe" && p.toxic) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.latinName?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [plants, query, light, safe]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Справочник растений
          </h1>
          <p className="mt-1 text-muted-foreground">
            {plants.length} видов с рекомендациями по уходу. Найдите своё и
            добавьте в коллекцию.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/identify">
            <Camera className="size-4" />
            Определить по фото
          </Link>
        </Button>
      </header>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или тегу…"
            className="pl-9"
            aria-label="Поиск растений"
          />
        </div>

        <Select
          value={light}
          onValueChange={(v) => setLight(v as Light | "any")}
        >
          <SelectTrigger className="sm:w-52" aria-label="Фильтр по освещению">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любое освещение</SelectItem>
            {LIGHT_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {LIGHT_LABEL[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={safe === "safe" ? "default" : "outline"}
          onClick={() => setSafe((s) => (s === "safe" ? "all" : "safe"))}
          aria-pressed={safe === "safe"}
        >
          Безопасно для питомцев
        </Button>
      </div>

      {/* Results */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-border/70 bg-muted/40"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Ничего не нашлось"
          description="Попробуйте изменить запрос или сбросить фильтры."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setLight("any");
                setSafe("all");
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}
