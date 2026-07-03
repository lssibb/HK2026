import type { DataSource } from "../datasource";
import type {
  AddUserPlantInput,
  Plant,
  UpdateUserPlantInput,
  UserPlant,
} from "../types";
import { http } from "./client";

/**
 * REST adapter for the Go backend. Endpoints and payloads follow
 * docs/openapi.yaml exactly. Enabled with VITE_DATA_SOURCE=http.
 *
 * This is written ahead of the backend: the moment the Go server implements
 * the contract, flipping the env var switches the whole app over — no
 * component changes.
 */
export class HttpDataSource implements DataSource {
  readonly kind = "http" as const;

  listPlants(): Promise<Plant[]> {
    return http.get<Plant[]>("/plants");
  }

  async getPlant(id: string): Promise<Plant | undefined> {
    return http.get<Plant>(`/plants/${id}`);
  }

  listFavorites(): Promise<string[]> {
    return http.get<string[]>("/favorites");
  }

  async addFavorite(plantId: string): Promise<void> {
    await http.post("/favorites", { plantId });
  }

  async removeFavorite(plantId: string): Promise<void> {
    await http.del(`/favorites/${plantId}`);
  }

  listUserPlants(): Promise<UserPlant[]> {
    return http.get<UserPlant[]>("/user-plants");
  }

  async getUserPlant(id: string): Promise<UserPlant | undefined> {
    return http.get<UserPlant>(`/user-plants/${id}`);
  }

  addUserPlant(input: AddUserPlantInput): Promise<UserPlant> {
    return http.post<UserPlant>("/user-plants", input);
  }

  updateUserPlant(
    id: string,
    patch: UpdateUserPlantInput
  ): Promise<UserPlant> {
    return http.patch<UserPlant>(`/user-plants/${id}`, patch);
  }

  async removeUserPlant(id: string): Promise<void> {
    await http.del(`/user-plants/${id}`);
  }

  markWatered(userPlantId: string, at?: string): Promise<UserPlant> {
    return http.post<UserPlant>(`/user-plants/${userPlantId}/water`, { at });
  }

  markRepotted(userPlantId: string, at?: string): Promise<UserPlant> {
    return http.post<UserPlant>(`/user-plants/${userPlantId}/repot`, { at });
  }
}
