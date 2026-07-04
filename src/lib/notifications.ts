import type { CareTask } from "@/api/types";
import { KEYS, read, write } from "@/api/local/storage";

export type PermissionState = NotificationPermission | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): PermissionState {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!notificationsSupported()) return "unsupported";
  return Notification.requestPermission();
}

const VERB: Record<CareTask["type"], string> = {
  water: "Пора полить",
  repot: "Пора пересадить",
};

/** A due task's identity for a given due date — changes once you act on it. */
function notifyKey(task: CareTask): string {
  return `${task.id}@${task.dueDate}`;
}

/**
 * Fire a system notification for each task that is due now (overdue or today)
 * and hasn't been announced for this due date yet. Deduped through
 * localStorage so reloads and the polling loop don't spam the user.
 */
export function syncNotifications(tasks: CareTask[]): void {
  if (notificationPermission() !== "granted") return;

  const due = tasks.filter(
    (t) => t.status === "overdue" || t.status === "due-today"
  );
  const notified = read<string[]>(KEYS.notifiedTasks, []);
  const seen = new Set(notified);
  const stillRelevant = new Set(due.map(notifyKey));

  let changed = false;
  for (const task of due) {
    const key = notifyKey(task);
    if (seen.has(key)) continue;
    try {
      new Notification(`${VERB[task.type]}: ${task.plantName}`, {
        body:
          task.type === "water"
            ? "Растению нужен полив. Отметьте, когда польёте."
            : "Пришло время пересадки. Загляните в карточку растения.",
        icon: "/leaf.svg",
        tag: task.id,
      });
    } catch {
      /* notification construction can throw on some platforms — ignore */
    }
    seen.add(key);
    changed = true;
  }

  // Keep only keys that are still due, so the store doesn't grow forever.
  const next = [...seen].filter((k) => stillRelevant.has(k));
  if (changed || next.length !== notified.length) {
    write(KEYS.notifiedTasks, next);
  }
}
