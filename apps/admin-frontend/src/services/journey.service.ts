import type { Journey, JourneyPhase } from '../lib/entities';
import { api } from '../lib/api/api-client';

export async function getJourneyById(id: number | string): Promise<Journey> {
  return api.get(`/journeys/${id}`);
}

export async function createJourney(
  subgroupId: number | string,
  data: Partial<Journey>,
): Promise<Journey> {
  return api.post(`/subgroups/${subgroupId}/journeys`, data);
}

export async function updateJourney(
  id: number | string,
  data: Partial<Journey>,
): Promise<Journey> {
  return api.patch(`/journeys/${id}`, data);
}

export async function deleteJourney(id: number | string): Promise<void> {
  return api.delete(`/journeys/${id}`);
}

export async function createJourneyPhase(
  journeyId: number | string,
  data: Partial<JourneyPhase>,
): Promise<JourneyPhase> {
  return api.post(`/journeys/${journeyId}/phases`, data);
}

export async function updateJourneyPhase(
  id: number | string,
  data: Partial<JourneyPhase>,
): Promise<JourneyPhase> {
  return api.patch(`/journey-phases/${id}`, data);
}

export async function deleteJourneyPhase(id: number | string): Promise<void> {
  return api.delete(`/journey-phases/${id}`);
}

export async function addJourneyPhaseProducts(
  id: number | string,
  data: { ean?: string; eans?: string[] },
): Promise<JourneyPhase> {
  return api.post(`/journey-phases/${id}/products`, data);
}

export async function removeJourneyPhaseProduct(
  id: number | string,
  productId: number | string,
): Promise<JourneyPhase> {
  return api.delete(`/journey-phases/${id}/products/${productId}`);
}

export async function addJourneyIngredients(
  journeyId: number | string,
  data: { ingredientId?: number; ingredientIds?: number[] },
): Promise<Journey> {
  return api.post(`/journeys/${journeyId}/ingredients`, data);
}

export async function removeJourneyIngredient(
  journeyId: number | string,
  ingredientId: number | string,
): Promise<Journey> {
  return api.delete(`/journeys/${journeyId}/ingredients/${ingredientId}`);
}
