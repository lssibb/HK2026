import type { Plant, UserPlant } from "@/api/types";
import { LIGHT_LABEL } from "@/lib/care";

export interface Recommendation {
  plant: Plant;
  /** Human-readable explanation of why this plant is suggested. */
  reason: string;
}

interface Signal {
  plant: Plant;
  weight: number; // owned counts more than favourited
}

/**
 * Suggest catalogue plants based on the user's collection and favourites.
 * Builds a lightweight taste profile (tag/light frequencies, pet-safety lean)
 * and scores unseen plants by overlap — each recommendation carries the single
 * strongest reason. Falls back to beginner-friendly picks on a cold start.
 * Pure and deterministic.
 */
export function recommendPlants(
  plants: Plant[],
  userPlants: UserPlant[],
  favorites: string[],
  limit = 4
): Recommendation[] {
  const ownedIds = new Set(userPlants.map((p) => p.plantId));
  const favIds = new Set(favorites);
  const excluded = new Set([...ownedIds, ...favIds]);
  const byId = new Map(plants.map((p) => [p.id, p]));

  const signals: Signal[] = [];
  for (const id of ownedIds) {
    const p = byId.get(id);
    if (p) signals.push({ plant: p, weight: 2 });
  }
  for (const id of favIds) {
    if (ownedIds.has(id)) continue;
    const p = byId.get(id);
    if (p) signals.push({ plant: p, weight: 1 });
  }

  const candidates = plants.filter((p) => !excluded.has(p.id));
  if (candidates.length === 0) return [];

  // Cold start: no preferences yet → recommend easy starter plants.
  if (signals.length === 0) {
    return candidates
      .map((plant) => ({ plant, score: beginnerScore(plant) }))
      .filter((r) => r.score > 0)
      .sort(sortByScoreThenName)
      .slice(0, limit)
      .map(({ plant }) => ({
        plant,
        reason: "Простое в уходе — хорошо для начала",
      }));
  }

  const tagWeights = new Map<string, number>();
  const lightWeights = new Map<string, number>();
  let safeWeight = 0;
  let totalWeight = 0;
  for (const { plant, weight } of signals) {
    totalWeight += weight;
    if (!plant.toxic) safeWeight += weight;
    lightWeights.set(
      plant.light,
      (lightWeights.get(plant.light) ?? 0) + weight
    );
    for (const tag of plant.tags ?? []) {
      tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + weight);
    }
  }
  const petSafePreferred = safeWeight / totalWeight > 0.6;

  const scored = candidates.map((plant) => {
    const tagScore =
      (plant.tags ?? []).reduce(
        (sum, tag) => sum + (tagWeights.get(tag) ?? 0),
        0
      ) * 2;
    const lightScore = (lightWeights.get(plant.light) ?? 0) * 1.5;
    const safeBonus = petSafePreferred && !plant.toxic ? 2 : 0;
    return { plant, score: tagScore + lightScore + safeBonus };
  });

  const ranked = scored.sort(sortByScoreThenName).slice(0, limit);

  // If nothing overlaps at all, fall back to beginner picks.
  if (ranked.every((r) => r.score === 0)) {
    return candidates
      .map((plant) => ({ plant, score: beginnerScore(plant) }))
      .sort(sortByScoreThenName)
      .slice(0, limit)
      .map(({ plant }) => ({
        plant,
        reason: "Стоит попробовать",
      }));
  }

  return ranked.map(({ plant }) => ({
    plant,
    reason: reasonFor(plant, signals, lightWeights, petSafePreferred),
  }));
}

function beginnerScore(p: Plant): number {
  const tags = p.tags ?? [];
  return (
    (tags.includes("для новичков") ? 3 : 0) +
    (tags.includes("неприхотливое") ? 2 : 0) +
    (p.toxic ? 0 : 1)
  );
}

function sortByScoreThenName(
  a: { score: number; plant: Plant },
  b: { score: number; plant: Plant }
): number {
  return b.score - a.score || a.plant.name.localeCompare(b.plant.name, "ru");
}

function reasonFor(
  candidate: Plant,
  signals: Signal[],
  lightWeights: Map<string, number>,
  petSafePreferred: boolean
): string {
  // Strongest signal: the source plant sharing the most tags.
  const candidateTags = new Set(candidate.tags ?? []);
  let best: { plant: Plant; shared: number; weight: number } | null = null;
  for (const { plant, weight } of signals) {
    const shared = (plant.tags ?? []).filter((t) => candidateTags.has(t)).length;
    if (shared > 0 && (!best || shared > best.shared)) {
      best = { plant, shared, weight };
    }
  }
  if (best) {
    return best.weight >= 2
      ? `Похоже на «${best.plant.name}» из вашей коллекции`
      : `Как «${best.plant.name}» из избранного`;
  }
  if (lightWeights.get(candidate.light)) {
    return `Подходит вашему освещению: ${LIGHT_LABEL[candidate.light].toLowerCase()}`;
  }
  if (petSafePreferred && !candidate.toxic) {
    return "Безопасно для питомцев, как ваша коллекция";
  }
  return "Стоит попробовать";
}
