import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, MapPin, Repeat2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ExchangeStatus } from "@/api/types";
import { ME_ID } from "@/api/types";
import { ChatPanel } from "@/components/ChatPanel";
import { ErrorState } from "@/components/ErrorState";
import { PlantTile } from "@/components/PlantTile";
import { Badge } from "@/components/ui/badge";
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
import {
  useExchangeListing,
  useRemoveListing,
  useUpdateListing,
} from "@/hooks/useExchange";
import { usePlant } from "@/hooks/usePlants";
import {
  EXCHANGE_STATUS_VARIANT,
  exchangeStatusLabel,
  humanDate,
} from "@/lib/care";
import { cn } from "@/lib/utils";

const STATUSES: ExchangeStatus[] = ["active", "reserved", "closed"];

export function ExchangeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listing, isLoading, isError, refetch } = useExchangeListing(id);
  const { data: plant } = usePlant(listing?.plantId);
  const update = useUpdateListing();
  const remove = useRemoveListing();

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted/40" />;
  }
  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }
  if (!listing) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Объявление не найдено.</p>
        <Button asChild variant="outline">
          <Link to="/exchange">
            <ArrowLeft className="size-4" />К доске обмена
          </Link>
        </Button>
      </div>
    );
  }

  const mine = listing.ownerId === ME_ID;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/exchange">
          <ArrowLeft className="size-4" />
          Обмен
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_1.1fr]">
        {/* Listing details */}
        <div className="space-y-4">
          <div className="relative">
            <PlantTile
              plant={plant ?? { id: listing.plantId, name: "Растение" }}
              rounded="rounded-2xl"
              className="aspect-[5/4] w-full"
            />
            <div className="absolute left-3 top-3 flex gap-1.5">
              <Badge variant={EXCHANGE_STATUS_VARIANT[listing.status]}>
                {exchangeStatusLabel(listing.status)}
              </Badge>
              {mine && <Badge variant="orchid">Моё объявление</Badge>}
            </div>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold leading-tight">
              {plant?.name ?? "Растение"}
            </h1>
            {plant?.latinName && (
              <p className="specimen text-lg text-muted-foreground">
                {plant.latinName}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {listing.ownerName}
              {listing.city ? (
                <>
                  {" · "}
                  <MapPin className="inline size-3.5 -translate-y-px" />{" "}
                  {listing.city}
                </>
              ) : null}
              {" · "}
              {humanDate(listing.createdAt)}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Состояние
            </h2>
            <p className="mt-1 text-sm">{listing.condition}</p>
            {listing.description && (
              <p className="mt-2 text-sm text-foreground/90">
                {listing.description}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-secondary/50 p-4">
            <Repeat2 className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Хочу взамен
              </h2>
              <p className="mt-1 text-sm font-medium">{listing.wants}</p>
            </div>
          </div>

          {plant && (
            <Button asChild variant="link" size="sm" className="-ml-3">
              <Link to={`/catalog/${plant.id}`}>
                <BookOpen className="size-4" />
                Открыть карточку в справочнике
              </Link>
            </Button>
          )}

          {/* Owner controls */}
          {mine && (
            <div className="rounded-xl border border-border/70 bg-card p-4">
              <h2 className="font-display text-base font-bold">
                Управление объявлением
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={listing.status === s ? "default" : "outline"}
                    aria-pressed={listing.status === s}
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate(
                        { id: listing.id, patch: { status: s } },
                        {
                          onSuccess: () =>
                            toast.success(
                              `Статус: ${exchangeStatusLabel(s).toLowerCase()}`
                            ),
                        }
                      )
                    }
                  >
                    {exchangeStatusLabel(s)}
                  </Button>
                ))}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                    Удалить объявление
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Удалить объявление?</DialogTitle>
                    <DialogDescription>
                      Объявление и переписка по нему будут удалены безвозвратно.
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
                        remove.mutate(listing.id, {
                          onSuccess: () => {
                            toast.success("Объявление удалено");
                            navigate("/exchange");
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
          )}
        </div>

        {/* Chat */}
        <div className={cn(listing.status === "closed" && "opacity-70")}>
          <ChatPanel
            listingId={listing.id}
            counterpartName={mine ? "интересующимся" : listing.ownerName}
          />
        </div>
      </div>
    </div>
  );
}
