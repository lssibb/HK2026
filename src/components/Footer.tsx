import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const LINKS = [
  { to: "/catalog", label: "Справочник" },
  { to: "/my-plants", label: "Мои растения" },
  { to: "/favorites", label: "Избранное" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/70">
      <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Sweet Garden
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Помощник по уходу за комнатными растениями: справочник, личная
            коллекция и напоминания о поливе.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1 border-t border-border/70 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} Sweet Garden. Все права защищены.</span>
        <span className="specimen">Сделано с любовью к растениям 🌿</span>
      </div>
    </footer>
  );
}
