/** Namespaced localStorage helpers with JSON (de)serialisation. */

const PREFIX = "orangerie:";

export const KEYS = {
  favorites: `${PREFIX}favorites`,
  userPlants: `${PREFIX}user-plants`,
  notifiedTasks: `${PREFIX}notified-tasks`,
} as const;

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Simple, collision-resistant id for client-created records. */
export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
