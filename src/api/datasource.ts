import type {
  AddUserPlantInput,
  CreateListingInput,
  ExchangeListing,
  ExchangeMessage,
  Plant,
  UpdateListingInput,
  UpdateUserPlantInput,
  UserPlant,
} from "./types";

/**
 * The single contract every part of the UI talks to. Components never touch
 * localStorage or fetch directly — they go through TanStack Query hooks, which
 * call the DataSource returned by `getDataSource()`.
 *
 * Two implementations satisfy this interface:
 *   - LocalDataSource  → browser localStorage (works today, no backend)
 *   - HttpDataSource   → the Go REST API (docs/openapi.yaml)
 *
 * Swapping local ↔ Go is a single env var (VITE_DATA_SOURCE); no component
 * code changes.
 */
export interface DataSource {
  /** Human-readable id of the active backend, shown in Settings. */
  readonly kind: "local" | "http";

  // Catalogue (справочник)
  listPlants(): Promise<Plant[]>;
  getPlant(id: string): Promise<Plant | undefined>;

  // Favourites (избранное) — stored as a set of plant ids
  listFavorites(): Promise<string[]>;
  addFavorite(plantId: string): Promise<void>;
  removeFavorite(plantId: string): Promise<void>;

  // Personal collection (мои растения)
  listUserPlants(): Promise<UserPlant[]>;
  getUserPlant(id: string): Promise<UserPlant | undefined>;
  addUserPlant(input: AddUserPlantInput): Promise<UserPlant>;
  updateUserPlant(
    id: string,
    patch: UpdateUserPlantInput
  ): Promise<UserPlant>;
  removeUserPlant(id: string): Promise<void>;

  // Care actions — stamp the last watered/repotted time (drives reminders)
  markWatered(userPlantId: string, at?: string): Promise<UserPlant>;
  markRepotted(userPlantId: string, at?: string): Promise<UserPlant>;

  // Exchange board (обмен растениями)
  listExchangeListings(): Promise<ExchangeListing[]>;
  getExchangeListing(id: string): Promise<ExchangeListing | undefined>;
  createExchangeListing(input: CreateListingInput): Promise<ExchangeListing>;
  updateExchangeListing(
    id: string,
    patch: UpdateListingInput
  ): Promise<ExchangeListing>;
  removeExchangeListing(id: string): Promise<void>;

  // Exchange chat — negotiate terms under a listing
  listExchangeMessages(listingId: string): Promise<ExchangeMessage[]>;
  sendExchangeMessage(listingId: string, text: string): Promise<ExchangeMessage>;
}

let singleton: DataSource | null = null;

/**
 * Resolve the active data source once, lazily. Reads VITE_DATA_SOURCE:
 *   - "http"  → talk to the Go backend at VITE_API_URL (or same-origin /api)
 *   - "local" → localStorage (default)
 */
export function getDataSource(): DataSource {
  if (singleton) return singleton;

  const mode = import.meta.env.VITE_DATA_SOURCE ?? "local";
  if (mode === "http") {
    // Lazy require to keep the local build from bundling nothing extra of note,
    // and to make the swap obvious in one place.
    const { HttpDataSource } = requireHttp();
    singleton = new HttpDataSource();
  } else {
    const { LocalDataSource } = requireLocal();
    singleton = new LocalDataSource();
  }
  return singleton;
}

// These indirections exist only so the imports read clearly at the call site.
function requireLocal() {
  return localModule;
}
function requireHttp() {
  return httpModule;
}

// Static imports (bundler-friendly); the branch above chooses which to use.
import * as localModule from "./local/localDataSource";
import * as httpModule from "./http/httpDataSource";
