import { ArrowLeftRight, Plus } from "lucide-react";

import { ME_ID } from "@/api/types";
import { CreateListingDialog } from "@/components/CreateListingDialog";
import { EmptyState } from "@/components/EmptyState";
import { ExchangeCard } from "@/components/ExchangeCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExchangeListings } from "@/hooks/useExchange";
import { usePlants } from "@/hooks/usePlants";

export function ExchangeBoard() {
  const { data: listings = [], isLoading } = useExchangeListings();
  const { data: plants = [] } = usePlants();
  const plantById = new Map(plants.map((p) => [p.id, p]));

  const board = listings.filter((l) => l.ownerId !== ME_ID);
  const mine = listings.filter((l) => l.ownerId === ME_ID);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Обмен растениями
          </h1>
          <p className="mt-1 text-muted-foreground">
            Отдавайте лишние растения и находите новые для своей коллекции.
          </p>
        </div>
        <CreateListingDialog>
          <Button>
            <Plus className="size-4" />
            Разместить растение
          </Button>
        </CreateListingDialog>
      </header>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Доска ({board.length})</TabsTrigger>
          <TabsTrigger value="mine">Мои объявления ({mine.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          {isLoading ? (
            <Grid skeleton />
          ) : board.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="Пока нет объявлений"
              description="Загляните позже — или разместите своё растение первым."
            />
          ) : (
            <Grid>
              {board.map((l) => (
                <ExchangeCard
                  key={l.id}
                  listing={l}
                  plant={plantById.get(l.plantId)}
                />
              ))}
            </Grid>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {mine.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="У вас нет объявлений"
              description="Разместите растение, которым готовы поделиться — и получайте предложения."
              action={
                <CreateListingDialog>
                  <Button>
                    <Plus className="size-4" />
                    Разместить растение
                  </Button>
                </CreateListingDialog>
              }
            />
          ) : (
            <Grid>
              {mine.map((l) => (
                <ExchangeCard
                  key={l.id}
                  listing={l}
                  plant={plantById.get(l.plantId)}
                />
              ))}
            </Grid>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Grid({
  children,
  skeleton,
}: {
  children?: React.ReactNode;
  skeleton?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skeleton
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-border/70 bg-muted/40"
            />
          ))
        : children}
    </div>
  );
}
