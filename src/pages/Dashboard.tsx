import { Link } from "react-router-dom";
import { CheckCircle2, Heart, Leaf, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CareTaskRow } from "@/components/CareTaskRow";
import { EmptyState } from "@/components/EmptyState";
import { useCareTasks } from "@/hooks/useCareTasks";
import { useCountUp } from "@/hooks/useCountUp";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlants } from "@/hooks/usePlants";
import { useUserPlants } from "@/hooks/useUserPlants";
import { activeTasks } from "@/lib/reminders";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

export function Dashboard() {
  const { data: plants = [] } = usePlants();
  const { data: userPlants = [] } = useUserPlants();
  const { data: favorites = [] } = useFavorites();
  const { tasks } = useCareTasks();

  const plantById = new Map(plants.map((p) => [p.id, p]));
  const active = activeTasks(tasks);
  const scheduled = tasks.length - active.length;
  const activeCount = useCountUp(active.length);

  return (
    <div className="space-y-8">
      {/* Hero — the state of your living things, not a marketing headline */}
      <header className="relative isolate animate-rise">
        <div
          aria-hidden
          className="animate-glow pointer-events-none absolute -left-16 -top-24 -z-10 h-64 w-80 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--orchid) 0%, transparent 70%)",
          }}
        />
        <p className="specimen text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {userPlants.length === 0 ? (
            "Заведём первое растение?"
          ) : active.length > 0 ? (
            <>
              Сегодня в Sweet Garden{" "}
              <span className="text-orchid tabular-nums">{activeCount}</span>{" "}
              {active.length === 1 ? "задача" : "дела"}
            </>
          ) : (
            "Всё полито. Растения довольны"
          )}
        </h1>
      </header>

      {/* Today's care */}
      <section className="space-y-3">
        {userPlants.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="Ваша коллекция пуста"
            description="Откройте справочник, найдите своё растение и добавьте его — будем вместе следить за поливом и пересадкой."
            action={
              <Button asChild>
                <Link to="/catalog">
                  <Leaf className="size-4" />
                  Открыть справочник
                </Link>
              </Button>
            }
          />
        ) : active.length > 0 ? (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Требуют внимания
            </h2>
            <div className="space-y-2">
              {active.map((task, i) => (
                <div
                  key={task.id}
                  className="animate-rise"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <CareTaskRow task={task} plant={plantById.get(task.plantId)} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="На сегодня всё сделано"
            description={
              scheduled > 0
                ? `Дальше по плану — ${scheduled} ${
                    scheduled === 1 ? "напоминание" : "напоминаний"
                  }. Мы сообщим, когда придёт время.`
                : "Загляните позже — напоминания появятся по расписанию."
            }
            action={
              <Button asChild variant="outline">
                <Link to="/my-plants">
                  <Sprout className="size-4" />К моим растениям
                </Link>
              </Button>
            }
          />
        )}
      </section>

      {/* Collection at a glance */}
      <section className="grid gap-3 sm:grid-cols-3">
        <StatLink
          to="/my-plants"
          icon={<Sprout className="size-5 text-primary" />}
          value={userPlants.length}
          label="в коллекции"
        />
        <StatLink
          to="/favorites"
          icon={<Heart className="size-5 text-orchid" />}
          value={favorites.length}
          label="в избранном"
        />
        <StatLink
          to="/catalog"
          icon={<Leaf className="size-5 text-living" />}
          value={plants.length}
          label="в справочнике"
        />
      </section>
    </div>
  );
}

function StatLink({
  to,
  icon,
  value,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-border hover:bg-muted/40"
    >
      <span className="grid size-10 place-items-center rounded-lg bg-secondary">
        {icon}
      </span>
      <span>
        <span className="font-display text-2xl font-bold leading-none">
          {value}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {label}
        </span>
      </span>
    </Link>
  );
}
