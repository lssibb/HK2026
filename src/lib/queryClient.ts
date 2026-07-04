import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Central registry of query keys — keeps invalidation consistent. */
export const qk = {
  plants: ["plants"] as const,
  plant: (id: string) => ["plants", id] as const,
  favorites: ["favorites"] as const,
  userPlants: ["user-plants"] as const,
  userPlant: (id: string) => ["user-plants", id] as const,
  exchangeListings: ["exchange-listings"] as const,
  exchangeListing: (id: string) => ["exchange-listings", id] as const,
  exchangeMessages: (id: string) => ["exchange-messages", id] as const,
};
