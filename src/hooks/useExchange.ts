import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDataSource } from "@/api/datasource";
import type { CreateListingInput, UpdateListingInput } from "@/api/types";
import { qk } from "@/lib/queryClient";

export function useExchangeListings() {
  return useQuery({
    queryKey: qk.exchangeListings,
    queryFn: () => getDataSource().listExchangeListings(),
  });
}

export function useExchangeListing(id: string | undefined) {
  return useQuery({
    queryKey: qk.exchangeListing(id ?? "—"),
    queryFn: () => getDataSource().getExchangeListing(id!),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) =>
      getDataSource().createExchangeListing(input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: qk.exchangeListings }),
  });
}

export function useUpdateListing() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateListingInput }) =>
      getDataSource().updateExchangeListing(id, patch),
    onSuccess: (_data, { id }) => {
      client.invalidateQueries({ queryKey: qk.exchangeListings });
      client.invalidateQueries({ queryKey: qk.exchangeListing(id) });
    },
  });
}

export function useRemoveListing() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getDataSource().removeExchangeListing(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: qk.exchangeListings }),
  });
}

export function useExchangeMessages(listingId: string | undefined) {
  return useQuery({
    queryKey: qk.exchangeMessages(listingId ?? "—"),
    queryFn: () => getDataSource().listExchangeMessages(listingId!),
    enabled: !!listingId,
  });
}

export function useSendMessage(listingId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      getDataSource().sendExchangeMessage(listingId, text),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: qk.exchangeMessages(listingId) }),
  });
}
