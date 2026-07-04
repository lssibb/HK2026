import { useEffect, useMemo } from "react";

import type { CareTask } from "@/api/types";
import { computeCareTasks } from "@/lib/reminders";
import { syncNotifications } from "@/lib/notifications";
import { usePlants } from "./usePlants";
import { useUserPlants } from "./useUserPlants";

/** Derived care tasks for the whole collection, recomputed from cached data. */
export function useCareTasks(): { tasks: CareTask[]; isLoading: boolean } {
  const plantsQ = usePlants();
  const userPlantsQ = useUserPlants();

  const tasks = useMemo(() => {
    if (!plantsQ.data || !userPlantsQ.data) return [];
    return computeCareTasks(userPlantsQ.data, plantsQ.data);
  }, [plantsQ.data, userPlantsQ.data]);

  return {
    tasks,
    isLoading: plantsQ.isLoading || userPlantsQ.isLoading,
  };
}

const POLL_INTERVAL_MS = 60 * 60 * 1000; // hourly re-check

/**
 * Mount once (in the app shell). Fires system notifications for due tasks and
 * re-checks periodically and on tab focus, so a plant that becomes due while
 * the app is open still gets announced.
 */
export function useReminderScheduler(tasks: CareTask[]): void {
  useEffect(() => {
    syncNotifications(tasks);
  }, [tasks]);

  useEffect(() => {
    const tick = () => syncNotifications(tasks);
    const timer = window.setInterval(tick, POLL_INTERVAL_MS);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, [tasks]);
}
