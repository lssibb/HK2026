/**
 * Domain model — the single source of truth shared by the localStorage adapter,
 * the HTTP adapter, and the Go backend contract (see docs/openapi.yaml).
 *
 * Keep these types and the OpenAPI schema in sync: the Go handlers must return
 * JSON matching these shapes.
 */

/** Light requirement, from shade-tolerant to full direct sun. */
export type Light = "low" | "medium" | "bright" | "direct";

export const LIGHT_LEVELS: Light[] = ["low", "medium", "bright", "direct"];

/** A reference-catalogue entry with care recommendations. */
export interface Plant {
  id: string;
  /** Common name, e.g. "Монстера". */
  name: string;
  /** Latin binomial, e.g. "Monstera deliciosa". Rendered in the specimen voice. */
  latinName?: string;
  /** Optional real photo URL (served by the backend). Falls back to a generated tile. */
  imageUrl?: string;

  /** Free-text watering recommendation. */
  watering: string;
  /** Typical days between waterings — seeds default reminders. */
  wateringIntervalDays?: number;

  light: Light;
  lightNote?: string;

  /** Free-text repotting recommendation. */
  repotting: string;
  /** Typical months between repottings. */
  repottingIntervalMonths?: number;

  /** Whether the plant is toxic to people or pets. */
  toxic: boolean;
  /** Details, e.g. "Токсична для кошек и собак при поедании". */
  toxicityNote?: string;

  /** Extra care notes, if any. */
  features?: string[];
  /** Free-form tags for filtering and future recommendations. */
  tags?: string[];
}

/** A plant the user actually owns — tracked in their personal collection. */
export interface UserPlant {
  id: string;
  /** Link to the catalogue entry this instance is based on. */
  plantId: string;
  /** User's own name for this specimen, e.g. "Моня на кухне". */
  nickname?: string;
  /** ISO date the plant was added to the collection. */
  dateAdded: string;
  /** Personal care notes. */
  notes?: string;

  /** Overrides the catalogue watering interval for this specimen. */
  wateringIntervalDays?: number;
  /** Overrides the catalogue repotting interval for this specimen. */
  repottingIntervalMonths?: number;
  /** Whether reminders are active for this specimen. */
  remindersEnabled: boolean;

  /** ISO datetime the plant was last watered. */
  lastWateredAt?: string;
  /** ISO datetime the plant was last repotted. */
  lastRepottedAt?: string;
}

export type CareType = "water" | "repot";
export type CareStatus = "overdue" | "due-today" | "upcoming";

/**
 * A derived care task. Computed from a UserPlant + its Plant on the client —
 * never persisted. The backend does not need a tasks table.
 */
export interface CareTask {
  id: string;
  userPlantId: string;
  plantId: string;
  plantName: string;
  type: CareType;
  /** ISO date the action is due. */
  dueDate: string;
  /** Whole days until due (negative = overdue). */
  daysUntil: number;
  status: CareStatus;
  /**
   * Fraction of the interval elapsed since the last action (0 = just done,
   * 1 = due now, >1 = overdue). Drives the moisture "thirst" ring. Watering only.
   */
  progress?: number;
}

/** Payload for adding a plant to the personal collection. */
export interface AddUserPlantInput {
  plantId: string;
  nickname?: string;
  notes?: string;
  wateringIntervalDays?: number;
  repottingIntervalMonths?: number;
  remindersEnabled?: boolean;
  /** Defaults to now. Lets a user backdate a plant they've owned a while. */
  dateAdded?: string;
}

/** Partial update for a personal-collection plant. */
export type UpdateUserPlantInput = Partial<
  Omit<UserPlant, "id" | "plantId" | "dateAdded">
>;
