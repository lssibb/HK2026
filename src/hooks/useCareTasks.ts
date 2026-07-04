import { useEffect, useMemo, useState } from "react";

import type { CareTask } from "@/api/types";
import { computeCareTasks } from "@/lib/reminders";
import { syncNotifications } from "@/lib/notifications";
import { usePlants } from "./usePlants";
import { useUserPlants } from "./useUserPlants";

// How often to re-derive tasks so day-boundary transitions (upcoming → due →
// overdue) are picked up while the app stays open.
const RECOMPUTE_INTERVAL_MS = 5 * 60 * 1000;

/** Derived care tasks for the whole collection, recomputed from cached data. */
export function useCareTasks(): { tasks: CareTask[]; isLoading: boolean } {
  const plantsQ = usePlants();
  const userPlantsQ = useUserPlants();
  const [tick, setTick] = useState(0);

  // Bump a tick on a timer and on tab focus so `tasks` (which bakes in the
  // current date) are re-derived even without a data change.
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const timer = window.setInterval(bump, RECOMPUTE_INTERVAL_MS);
    window.addEventListener("focus", bump);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", bump);
    };
  }, []);

  const tasks = useMemo(() => {
    if (!plantsQ.data || !userPlantsQ.data) return [];
    return computeCareTasks(userPlantsQ.data, plantsQ.data);
    // `tick` intentionally re-derives against the current date.
  }, [plantsQ.data, userPlantsQ.data, tick]);

  return {
    tasks,
    isLoading: plantsQ.isLoading || userPlantsQ.isLoading,
  };
}

/**
 * Mount once (in the app shell). Fires system notifications for due tasks.
 * `tasks` are re-derived periodically by useCareTasks, so a plant that becomes
 * due while the app is open still gets announced.
 */
export function useReminderScheduler(tasks: CareTask[]): void {
  useEffect(() => {
    syncNotifications(tasks);
  }, [tasks]);
}
