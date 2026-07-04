import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDataSource } from "@/api/datasource";
import { qk } from "@/lib/queryClient";

export function useFavorites() {
  return useQuery({
    queryKey: qk.favorites,
    queryFn: () => getDataSource().listFavorites(),
  });
}

/** Returns a toggler plus the current set for O(1) membership checks. */
export function useToggleFavorite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      plantId,
      next,
    }: {
      plantId: string;
      next: boolean;
    }) => {
      const ds = getDataSource();
      if (next) await ds.addFavorite(plantId);
      else await ds.removeFavorite(plantId);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.favorites });
    },
  });
}
