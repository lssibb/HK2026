import { NavLink, Outlet } from "react-router-dom";
import {
  Heart,
  LayoutGrid,
  Leaf,
  Moon,
  Sprout,
  Sun,
} from "lucide-react";

import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { useCareTasks, useReminderScheduler } from "@/hooks/useCareTasks";
import { overdueTasks } from "@/lib/reminders";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Сегодня", icon: LayoutGrid, end: true },
  { to: "/catalog", label: "Справочник", icon: Leaf, end: false },
  { to: "/my-plants", label: "Мои растения", icon: Sprout, end: false },
  { to: "/favorites", label: "Избранное", icon: Heart, end: false },
];

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Leaf className="size-5" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">
        Оранжерея
      </span>
    </NavLink>
  );
}

function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Переключить тему"
      onClick={toggle}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </Button>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  badge,
  variant,
}: {
  to: string;
  label: string;
  icon: typeof Leaf;
  end: boolean;
  badge?: number;
  variant: "sidebar" | "tab";
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "relative flex items-center transition-colors",
          variant === "sidebar" &&
            "gap-3 rounded-lg px-3 py-2 text-sm font-medium",
          variant === "sidebar" &&
            (isActive
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"),
          variant === "tab" &&
            "flex-col gap-0.5 px-3 py-1.5 text-[11px] font-medium",
          variant === "tab" &&
            (isActive ? "text-primary" : "text-muted-foreground")
        )
      }
    >
      <span className="relative">
        <Icon className={variant === "tab" ? "size-5" : "size-4.5"} />
        {badge ? (
          <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-orchid px-1 text-[10px] font-bold leading-4 text-orchid-foreground">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </NavLink>
  );
}

export function Layout() {
  const { tasks } = useCareTasks();
  useReminderScheduler(tasks);
  const overdue = overdueTasks(tasks).length;

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border/70 bg-card/40 p-4 md:flex">
        <div className="px-1 py-2">
          <Brand />
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              variant="sidebar"
              badge={item.to === "/my-plants" ? overdue : undefined}
            />
          ))}
        </nav>
        <div className="flex items-center gap-1 border-t border-border/70 pt-3">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-2.5 backdrop-blur md:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border/70 bg-background/90 py-1.5 backdrop-blur md:hidden">
        {NAV.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            variant="tab"
            badge={item.to === "/my-plants" ? overdue : undefined}
          />
        ))}
      </nav>
    </div>
  );
}
