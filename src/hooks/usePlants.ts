import { useQuery } from "@tanstack/react-query";

import { getDataSource } from "@/api/datasource";
import { qk } from "@/lib/queryClient";

export function usePlants() {
  return useQuery({
    queryKey: qk.plants,
    queryFn: () => getDataSource().listPlants(),
  });
}

export function usePlant(id: string | undefined) {
  return useQuery({
    queryKey: qk.plant(id ?? "—"),
    queryFn: () => getDataSource().getPlant(id!),
    enabled: !!id,
  });
}
