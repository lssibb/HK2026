import { cn } from "@/lib/utils";
import type { Plant } from "@/api/types";

/**
 * A self-contained visual for a plant. When the backend provides a real photo
 * (imageUrl) we use it; otherwise we render a deterministic botanical tile —
 * a duotone gradient + leaf motif seeded by the plant id, so every plant looks
 * consistent across the app with zero external assets.
 */

const GRADIENTS: [string, string][] = [
  ["#1E5B41", "#39946A"], // foliage
  ["#123A2F", "#2C7A63"], // deep pine
  ["#3A2B52", "#C13D82"], // grow-light (signature)
  ["#154A49", "#2E8F89"], // teal
  ["#4E356A", "#9B4E8F"], // orchid violet
  ["#2C5A32", "#82A83E"], // chartreuse leaf
];

// Simple leaf/foliage silhouettes, drawn in a 100x100 viewBox.
const MOTIFS: string[] = [
  "M78 14C78 55 58 82 26 82 18 82 14 74 14 62 14 30 40 14 78 14Z M60 30C40 42 28 60 22 82",
  "M50 8C64 30 64 54 50 92 36 54 36 30 50 8Z M50 20V88",
  "M20 80C20 44 44 22 84 20 84 56 60 80 24 80Z",
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function PlantTile({
  plant,
  className,
  rounded = "rounded-xl",
}: {
  plant: Pick<Plant, "id" | "name" | "imageUrl">;
  className?: string;
  rounded?: string;
}) {
  if (plant.imageUrl) {
    return (
      <img
        src={plant.imageUrl}
        alt={plant.name}
        loading="lazy"
        className={cn("h-full w-full object-cover", rounded, className)}
      />
    );
  }

  const h = hash(plant.id || plant.name);
  const [from, to] = GRADIENTS[h % GRADIENTS.length];
  const motif = MOTIFS[(h >> 4) % MOTIFS.length];
  const rotate = (h % 4) * 15 - 20;

  return (
    <div
      role="img"
      aria-label={plant.name}
      className={cn("relative overflow-hidden", rounded, className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute -right-2 -bottom-3 h-[80%] w-[80%] opacity-[0.18]"
        style={{ transform: `rotate(${rotate}deg)` }}
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={motif} />
      </svg>
      <span
        className="specimen absolute left-3 top-2 text-2xl font-medium text-white/80"
        aria-hidden="true"
      >
        {plant.name.charAt(0)}
      </span>
    </div>
  );
}
