import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  parseISO,
} from "date-fns";

import type {
  CareStatus,
  CareTask,
  CareType,
  Plant,
  UserPlant,
} from "@/api/types";

/** Days out to the horizon of "due soon" shown on the dashboard. */
export const SOON_HORIZON_DAYS = 3;

function classify(daysUntil: number): CareStatus {
  if (daysUntil < 0) return "overdue";
  if (daysUntil === 0) return "due-today";
  return "upcoming";
}

function makeTask(
  up: UserPlant,
  plant: Plant,
  type: CareType,
  base: string,
  intervalDays: number
): CareTask {
  const due = addDays(parseISO(base), intervalDays);
  const daysUntil = differenceInCalendarDays(due, new Date());
  return {
    id: `${up.id}:${type}`,
    userPlantId: up.id,
    plantId: plant.id,
    plantName: up.nickname || plant.name,
    type,
    dueDate: due.toISOString(),
    daysUntil,
    status: classify(daysUntil),
  };
}

/**
 * Compute the next watering and repotting task for each personal-collection
 * plant that has reminders on and a known interval. Pure and deterministic —
 * derived from stored data, never persisted.
 */
export function computeCareTasks(
  userPlants: UserPlant[],
  plants: Plant[]
): CareTask[] {
  const byId = new Map(plants.map((p) => [p.id, p]));
  const tasks: CareTask[] = [];

  for (const up of userPlants) {
    if (!up.remindersEnabled) continue;
    const plant = byId.get(up.plantId);
    if (!plant) continue;

    const waterInterval = up.wateringIntervalDays ?? plant.wateringIntervalDays;
    if (waterInterval && waterInterval > 0) {
      const base = up.lastWateredAt ?? up.dateAdded;
      tasks.push(makeTask(up, plant, "water", base, waterInterval));
    }

    const repotMonths =
      up.repottingIntervalMonths ?? plant.repottingIntervalMonths;
    if (repotMonths && repotMonths > 0) {
      const base = up.lastRepottedAt ?? up.dateAdded;
      const due = addMonths(parseISO(base), repotMonths);
      const daysUntil = differenceInCalendarDays(due, new Date());
      tasks.push({
        id: `${up.id}:repot`,
        userPlantId: up.id,
        plantId: plant.id,
        plantName: up.nickname || plant.name,
        type: "repot",
        dueDate: due.toISOString(),
        daysUntil,
        status: classify(daysUntil),
      });
    }
  }

  // Most urgent first.
  return tasks.sort((a, b) => a.daysUntil - b.daysUntil);
}

/** Tasks that need attention now: overdue or due within the soon-horizon. */
export function activeTasks(tasks: CareTask[]): CareTask[] {
  return tasks.filter((t) => t.daysUntil <= SOON_HORIZON_DAYS);
}

export function overdueTasks(tasks: CareTask[]): CareTask[] {
  return tasks.filter((t) => t.status === "overdue");
}
