import { Droplet, PawPrint, ShieldCheck, Sun } from "lucide-react";

import type { Light, Plant } from "@/api/types";
import { LIGHT_LABEL, LIGHT_RANK } from "@/lib/care";
import { cn } from "@/lib/utils";

/** Four ascending bars showing how much light a plant wants (1–4). */
export function LightArc({
  light,
  className,
}: {
  light: Light;
  className?: string;
}) {
  const rank = LIGHT_RANK[light];
  return (
    <span
      className={cn("inline-flex items-end gap-0.5", className)}
      aria-label={LIGHT_LABEL[light]}
      title={LIGHT_LABEL[light]}
    >
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={cn(
            "w-1 rounded-full",
            step <= rank ? "bg-warn" : "bg-current opacity-20"
          )}
          style={{ height: `${4 + step * 2}px` }}
        />
      ))}
    </span>
  );
}

function SpecItem({
  icon,
  children,
  tone = "muted",
  title,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "muted" | "warn" | "living";
  title?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        tone === "warn" && "text-warn",
        tone === "living" && "text-living",
        tone === "muted" && "text-muted-foreground"
      )}
      title={title}
    >
      {icon}
      {children}
    </span>
  );
}

/** The compact care-spec strip shown on every plant card. */
export function CareSpecStrip({
  plant,
  className,
}: {
  plant: Plant;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1.5",
        className
      )}
    >
      <SpecItem
        icon={<Droplet className="size-3.5 text-sky-500" />}
        title="Частота полива"
      >
        {plant.wateringIntervalDays
          ? `${plant.wateringIntervalDays} дн.`
          : "по грунту"}
      </SpecItem>

      <SpecItem
        icon={<Sun className="size-3.5 text-warn" />}
        title={`Освещение: ${LIGHT_LABEL[plant.light]}`}
      >
        <LightArc light={plant.light} className="text-foreground" />
      </SpecItem>

      {plant.toxic ? (
        <SpecItem
          icon={<PawPrint className="size-3.5" />}
          tone="warn"
          title={plant.toxicityNote}
        >
          Токсично
        </SpecItem>
      ) : (
        <SpecItem
          icon={<ShieldCheck className="size-3.5" />}
          tone="living"
          title="Безопасно для питомцев"
        >
          Безопасно
        </SpecItem>
      )}
    </div>
  );
}
