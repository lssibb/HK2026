import type { DataSource } from "../datasource";
import type {
  AddUserPlantInput,
  CreateListingInput,
  ExchangeListing,
  ExchangeMessage,
  Plant,
  UpdateListingInput,
  UpdateUserPlantInput,
  UserPlant,
} from "../types";
import { ME_ID } from "../types";
import seed from "../seed/plants.seed.json";
import exchangeSeed from "../seed/exchange.seed.json";
import { KEYS, makeId, myName, read, write } from "./storage";

// The seed catalogue ships with the app so the base version works with no
// backend. Cast once here — the JSON is authored to match the Plant shape.
const CATALOG = seed as Plant[];

// Shape of the exchange seed (relative timestamps resolved on first run).
interface ListingSeed {
  id: string;
  plantId: string;
  ownerId: string;
  ownerName: string;
  condition: string;
  description?: string;
  wants: string;
  city?: string;
  status: ExchangeListing["status"];
  daysAgo: number;
}
interface MessageSeed {
  id: string;
  listingId: string;
  authorId: string;
  authorName: string;
  text: string;
  hoursAgo: number;
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

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

  // ── Exchange ─────────────────────────────────────────────────────────────

  /** Populate demo listings from other users once, so the board isn't empty. */
  private ensureExchangeSeeded(): void {
    if (read<boolean>(KEYS.exchangeSeeded, false)) return;
    const { listings, messages } = exchangeSeed as {
      listings: ListingSeed[];
      messages: MessageSeed[];
    };
    const seededListings: ExchangeListing[] = listings.map((l) => {
      const { daysAgo, ...rest } = l;
      return { ...rest, createdAt: isoDaysAgo(daysAgo) };
    });
    const seededMessages: ExchangeMessage[] = messages.map((m) => {
      const { hoursAgo, ...rest } = m;
      return { ...rest, createdAt: isoHoursAgo(hoursAgo) };
    });
    write(KEYS.exchangeListings, seededListings);
    write(KEYS.exchangeMessages, seededMessages);
    write(KEYS.exchangeSeeded, true);
  }

  async listExchangeListings(): Promise<ExchangeListing[]> {
    this.ensureExchangeSeeded();
    return read<ExchangeListing[]>(KEYS.exchangeListings, []).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }

  async getExchangeListing(id: string): Promise<ExchangeListing | undefined> {
    this.ensureExchangeSeeded();
    return read<ExchangeListing[]>(KEYS.exchangeListings, []).find(
      (l) => l.id === id
    );
  }

  async createExchangeListing(
    input: CreateListingInput
  ): Promise<ExchangeListing> {
    this.ensureExchangeSeeded();
    const listings = read<ExchangeListing[]>(KEYS.exchangeListings, []);
    const listing: ExchangeListing = {
      id: makeId(),
      plantId: input.plantId,
      ownerId: ME_ID,
      ownerName: myName(),
      condition: input.condition.trim(),
      description: input.description?.trim() || undefined,
      wants: input.wants.trim(),
      city: input.city?.trim() || undefined,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    write(KEYS.exchangeListings, [listing, ...listings]);
    return listing;
  }

  async updateExchangeListing(
    id: string,
    patch: UpdateListingInput
  ): Promise<ExchangeListing> {
    const listings = read<ExchangeListing[]>(KEYS.exchangeListings, []);
    const idx = listings.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Объявление ${id} не найдено`);
    const updated = { ...listings[idx], ...patch };
    listings[idx] = updated;
    write(KEYS.exchangeListings, listings);
    return updated;
  }

  async removeExchangeListing(id: string): Promise<void> {
    const listings = read<ExchangeListing[]>(KEYS.exchangeListings, []);
    write(
      KEYS.exchangeListings,
      listings.filter((l) => l.id !== id)
    );
    const messages = read<ExchangeMessage[]>(KEYS.exchangeMessages, []);
    write(
      KEYS.exchangeMessages,
      messages.filter((m) => m.listingId !== id)
    );
  }

  async listExchangeMessages(listingId: string): Promise<ExchangeMessage[]> {
    this.ensureExchangeSeeded();
    return read<ExchangeMessage[]>(KEYS.exchangeMessages, [])
      .filter((m) => m.listingId === listingId)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  }

  async sendExchangeMessage(
    listingId: string,
    text: string
  ): Promise<ExchangeMessage> {
    const messages = read<ExchangeMessage[]>(KEYS.exchangeMessages, []);
    const message: ExchangeMessage = {
      id: makeId(),
      listingId,
      authorId: ME_ID,
      authorName: myName(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    write(KEYS.exchangeMessages, [...messages, message]);
    return message;
  }
}
