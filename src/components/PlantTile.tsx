import { cn } from "@/lib/utils";
import type { Plant } from "@/api/types";

/**
 * A self-contained visual for a plant. When the backend provides a real photo
 * (imageUrl) we use it; otherwise we render a deterministic botanical tile — a
 * duotone gradient plus a line-art illustration whose *form* matches the plant
 * (rosette, frond, vine, bloom, tree…), seeded by id for subtle variety. No
 * external assets, consistent across the whole app.
 */

const GRADIENTS: [string, string][] = [
  ["#1E5B41", "#39946A"], // foliage
  ["#123A2F", "#2C7A63"], // deep pine
  ["#3A2B52", "#C13D82"], // grow-light (signature)
  ["#154A49", "#2E8F89"], // teal
  ["#4E356A", "#9B4E8F"], // orchid violet
  ["#2C5A32", "#82A83E"], // chartreuse leaf
];

type Form = "succulent" | "fern" | "flower" | "vine" | "tree" | "leaf";
const FORMS: Form[] = ["succulent", "fern", "flower", "vine", "tree", "leaf"];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function formFor(tags: string[] | undefined, h: number): Form {
  if (tags) {
    if (tags.includes("суккулент")) return "succulent";
    if (tags.includes("папоротник")) return "fern";
    if (tags.includes("цветущее")) return "flower";
    if (tags.includes("крупномер")) return "vine";
    if (tags.includes("деревце")) return "tree";
    if (tags.includes("декоративнолистное")) return "leaf";
  }
  return FORMS[h % FORMS.length];
}

/** Line-art botanical illustration in a 100×100 viewBox, drawn with strokes. */
function BotanicalMark({ form }: { form: Form }) {
  switch (form) {
    case "succulent":
      return (
        <g>
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={i}
              d="M50 54 C 44 42 46 28 50 21 C 54 28 56 42 50 54 Z"
              transform={`rotate(${i * (360 / 7)} 50 54)`}
            />
          ))}
          <circle cx={50} cy={54} r={3} />
        </g>
      );
    case "fern":
      return (
        <g>
          <path d="M50 84 Q 47 52 50 20" />
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 30 + i * 9;
            const len = 15 - i * 1.4;
            return (
              <g key={i}>
                <path d={`M50 ${y} Q ${50 - len / 2} ${y - 2} ${50 - len} ${y - 7}`} />
                <path d={`M50 ${y} Q ${50 + len / 2} ${y - 2} ${50 + len} ${y - 7}`} />
              </g>
            );
          })}
        </g>
      );
    case "flower":
      return (
        <g>
          <path d="M50 84 L 50 44" />
          <path d="M50 64 C 39 61 35 52 41 47 C 48 50 50 58 50 64 Z" />
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse
              key={i}
              cx={50}
              cy={30}
              rx={4.5}
              ry={9}
              transform={`rotate(${i * 60} 50 39)`}
            />
          ))}
          <circle cx={50} cy={39} r={3.5} />
        </g>
      );
    case "vine": // monstera-style split leaf
      return (
        <g>
          <path d="M50 20 C 73 25 82 45 73 64 C 67 77 56 82 50 82 C 44 82 33 77 27 64 C 18 45 27 25 50 20 Z" />
          <path d="M50 30 L 50 78" />
          <path d="M50 44 L 66 40 M50 44 L 34 40 M50 58 L 68 58 M50 58 L 32 58 M50 70 L 62 74 M50 70 L 38 74" />
        </g>
      );
    case "tree":
      return (
        <g>
          <path d="M50 84 L 50 50" />
          <circle cx={50} cy={38} r={17} />
          <path d="M50 50 L 40 42 M50 55 L 61 47 M50 60 L 42 54" />
        </g>
      );
    default: // simple pair of leaves
      return (
        <g>
          <path d="M50 82 C 39 71 37 50 50 33 C 63 50 61 71 50 82 Z" />
          <path d="M50 80 L 50 40" />
          <path d="M62 66 C 70 60 72 50 68 44 C 61 48 60 58 62 66 Z" />
        </g>
      );
  }
}

export function PlantTile({
  plant,
  className,
  rounded = "rounded-xl",
}: {
  plant: Pick<Plant, "id" | "name" | "imageUrl" | "tags">;
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
  const form = formFor(plant.tags, h);
  const rotate = (h % 5) * 4 - 8;

  return (
    <div
      role="img"
      aria-label={plant.name}
      className={cn("relative overflow-hidden", rounded, className)}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="white"
        strokeOpacity={0.85}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: `rotate(${rotate}deg)` }}
        aria-hidden="true"
      >
        <BotanicalMark form={form} />
      </svg>
    </div>
  );
}
