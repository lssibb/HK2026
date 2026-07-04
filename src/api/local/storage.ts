/** Namespaced localStorage helpers with JSON (de)serialisation. */

const PREFIX = "sweetgarden:";
/** Former prefix, kept only for the one-time migration below. */
const LEGACY_PREFIX = "orangerie:";

export const KEYS = {
  favorites: `${PREFIX}favorites`,
  userPlants: `${PREFIX}user-plants`,
  notifiedTasks: `${PREFIX}notified-tasks`,
  exchangeListings: `${PREFIX}exchange-listings`,
  exchangeMessages: `${PREFIX}exchange-messages`,
  exchangeSeeded: `${PREFIX}exchange-seeded`,
  profileName: `${PREFIX}profile-name`,
} as const;

/** The current user's display name for exchange listings and chat. */
export function myName(): string {
  return read<string>(KEYS.profileName, "Вы");
}

/**
 * One-time rename of persisted keys after the "Оранжерея" → "Sweet Garden"
 * rebrand. Moves every `orangerie:*` entry to `sweetgarden:*` (without
 * clobbering a newer value) and drops the old keys. Idempotent and safe to run
 * on every startup. Must run before anything reads storage (see main.tsx).
 */
export function migrateLegacyStorage(): void {
  try {
    const legacyKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) legacyKeys.push(k);
    }
    for (const oldKey of legacyKeys) {
      const newKey = PREFIX + oldKey.slice(LEGACY_PREFIX.length);
      const value = localStorage.getItem(oldKey);
      if (value != null && localStorage.getItem(newKey) == null) {
        localStorage.setItem(newKey, value);
      }
      localStorage.removeItem(oldKey);
    }
  } catch {
    /* storage unavailable (private mode, quota) — nothing to migrate */
  }
}

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
