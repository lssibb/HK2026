import type { DataSource } from "../datasource";
import type {
  AddUserPlantInput,
  Plant,
  UpdateUserPlantInput,
  UserPlant,
} from "../types";
import seed from "../seed/plants.seed.json";
import { KEYS, makeId, read, write } from "./storage";

// The seed catalogue ships with the app so the base version works with no
// backend. Cast once here — the JSON is authored to match the Plant shape.
const CATALOG = seed as Plant[];

/** localStorage-backed data source. The default in the base (offline) version. */
export class LocalDataSource implements DataSource {
  readonly kind = "local" as const;

  async listPlants(): Promise<Plant[]> {
    return CATALOG;
  }

  async getPlant(id: string): Promise<Plant | undefined> {
    return CATALOG.find((p) => p.id === id);
  }

  async listFavorites(): Promise<string[]> {
    return read<string[]>(KEYS.favorites, []);
  }

  async addFavorite(plantId: string): Promise<void> {
    const favs = read<string[]>(KEYS.favorites, []);
    if (!favs.includes(plantId)) write(KEYS.favorites, [...favs, plantId]);
  }

  async removeFavorite(plantId: string): Promise<void> {
    const favs = read<string[]>(KEYS.favorites, []);
    write(
      KEYS.favorites,
      favs.filter((id) => id !== plantId)
    );
  }

  async listUserPlants(): Promise<UserPlant[]> {
    return read<UserPlant[]>(KEYS.userPlants, []);
  }

  async getUserPlant(id: string): Promise<UserPlant | undefined> {
    return read<UserPlant[]>(KEYS.userPlants, []).find((p) => p.id === id);
  }

  async addUserPlant(input: AddUserPlantInput): Promise<UserPlant> {
    const plants = read<UserPlant[]>(KEYS.userPlants, []);
    const now = new Date().toISOString();
    const plant: UserPlant = {
      id: makeId(),
      plantId: input.plantId,
      nickname: input.nickname?.trim() || undefined,
      dateAdded: input.dateAdded ?? now,
      notes: input.notes?.trim() || undefined,
      wateringIntervalDays: input.wateringIntervalDays,
      repottingIntervalMonths: input.repottingIntervalMonths,
      remindersEnabled: input.remindersEnabled ?? true,
      // Seed the reminder clock from the add date so the first task is scheduled.
      lastWateredAt: input.dateAdded ?? now,
    };
    write(KEYS.userPlants, [plant, ...plants]);
    return plant;
  }

  async updateUserPlant(
    id: string,
    patch: UpdateUserPlantInput
  ): Promise<UserPlant> {
    const plants = read<UserPlant[]>(KEYS.userPlants, []);
    const idx = plants.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Растение ${id} не найдено`);
    const updated: UserPlant = { ...plants[idx], ...patch };
    plants[idx] = updated;
    write(KEYS.userPlants, plants);
    return updated;
  }

  async removeUserPlant(id: string): Promise<void> {
    const plants = read<UserPlant[]>(KEYS.userPlants, []);
    write(
      KEYS.userPlants,
      plants.filter((p) => p.id !== id)
    );
  }

  async markWatered(userPlantId: string, at?: string): Promise<UserPlant> {
    return this.updateUserPlant(userPlantId, {
      lastWateredAt: at ?? new Date().toISOString(),
    });
  }

  async markRepotted(userPlantId: string, at?: string): Promise<UserPlant> {
    return this.updateUserPlant(userPlantId, {
      lastRepottedAt: at ?? new Date().toISOString(),
    });
  }
}
