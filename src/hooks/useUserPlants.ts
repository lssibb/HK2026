import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDataSource } from "@/api/datasource";
import type { AddUserPlantInput, UpdateUserPlantInput } from "@/api/types";
import { qk } from "@/lib/queryClient";

export function useUserPlants() {
  return useQuery({
    queryKey: qk.userPlants,
    queryFn: () => getDataSource().listUserPlants(),
  });
}

export function useUserPlant(id: string | undefined) {
  return useQuery({
    queryKey: qk.userPlant(id ?? "—"),
    queryFn: () => getDataSource().getUserPlant(id!),
    enabled: !!id,
  });
}

function useInvalidateCollection() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: qk.userPlants });
}

export function useAddUserPlant() {
  const invalidate = useInvalidateCollection();
  return useMutation({
    mutationFn: (input: AddUserPlantInput) =>
      getDataSource().addUserPlant(input),
    onSuccess: invalidate,
  });
}

export function useUpdateUserPlant() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: UpdateUserPlantInput;
    }) => getDataSource().updateUserPlant(id, patch),
    onSuccess: (_data, { id }) => {
      client.invalidateQueries({ queryKey: qk.userPlants });
      client.invalidateQueries({ queryKey: qk.userPlant(id) });
    },
  });
}

export function useRemoveUserPlant() {
  const invalidate = useInvalidateCollection();
  return useMutation({
    mutationFn: (id: string) => getDataSource().removeUserPlant(id),
    onSuccess: invalidate,
  });
}

export function useMarkWatered() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (userPlantId: string) =>
      getDataSource().markWatered(userPlantId),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: qk.userPlants });
      client.invalidateQueries({ queryKey: qk.userPlant(id) });
    },
  });
}

export function useMarkRepotted() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (userPlantId: string) =>
      getDataSource().markRepotted(userPlantId),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: qk.userPlants });
      client.invalidateQueries({ queryKey: qk.userPlant(id) });
    },
  });
}
