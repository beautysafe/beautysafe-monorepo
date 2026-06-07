import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Journey, JourneyPhase } from '../lib/entities';
import {
  addJourneyIngredients,
  addJourneyPhaseProducts,
  createJourney,
  createJourneyPhase,
  deleteJourney,
  deleteJourneyPhase,
  getJourneyById,
  removeJourneyIngredient,
  removeJourneyPhaseProduct,
  updateJourney,
  updateJourneyPhase,
} from '../services/journey.service';

export function useJourneyById(id: number | string) {
  return useQuery({
    queryKey: ['journey', id],
    queryFn: () => getJourneyById(id),
    enabled: !!id,
  });
}

export function useCreateJourney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subgroupId,
      data,
    }: {
      subgroupId: number | string;
      data: Partial<Journey>;
    }) => createJourney(subgroupId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subgroup-journeys'] }),
  });
}

export function useUpdateJourney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Journey> }) =>
      updateJourney(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subgroup-journeys'] }),
  });
}

export function useDeleteJourney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteJourney(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subgroup-journeys'] }),
  });
}

export function useCreateJourneyPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      journeyId,
      data,
    }: {
      journeyId: number | string;
      data: Partial<JourneyPhase>;
    }) => createJourneyPhase(journeyId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journey'] }),
  });
}

export function useUpdateJourneyPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: Partial<JourneyPhase>;
    }) => updateJourneyPhase(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journey'] }),
  });
}

export function useDeleteJourneyPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteJourneyPhase(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journey'] }),
  });
}

export function useAddJourneyPhaseProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: { ean?: string; eans?: string[] };
    }) => addJourneyPhaseProducts(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journey'] }),
  });
}

export function useRemoveJourneyPhaseProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      productId,
    }: {
      id: number | string;
      productId: number | string;
    }) => removeJourneyPhaseProduct(id, productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journey'] }),
  });
}

export function useAddJourneyIngredients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      journeyId,
      data,
    }: {
      journeyId: number | string;
      data: { ingredientId?: number; ingredientIds?: number[] };
    }) => addJourneyIngredients(journeyId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journey'] }),
  });
}

export function useRemoveJourneyIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      journeyId,
      ingredientId,
    }: {
      journeyId: number | string;
      ingredientId: number | string;
    }) => removeJourneyIngredient(journeyId, ingredientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journey'] }),
  });
}
