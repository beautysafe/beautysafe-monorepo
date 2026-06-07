import type { Journey, ProductList, SubGroupJourney } from '../lib/entities';
import { api } from '../lib/api/api-client';

export async function listSubgroups(): Promise<SubGroupJourney[]> {
  return api.get('/subgroups');
}

export async function getSubgroupById(id: number | string): Promise<SubGroupJourney> {
  return api.get(`/subgroups/${id}`);
}

export async function getSubgroupProductLists(id: number | string): Promise<ProductList[]> {
  return api.get(`/subgroups/${id}/product-lists`);
}

export async function getSubgroupJourneys(id: number | string): Promise<Journey[]> {
  return api.get(`/subgroups/${id}/journeys`);
}

export async function createSubgroup(
  groupId: number | string,
  data: Partial<SubGroupJourney>,
): Promise<SubGroupJourney> {
  return api.post(`/groups/${groupId}/subgroups`, data);
}

export async function updateSubgroup(
  id: number | string,
  data: Partial<SubGroupJourney>,
): Promise<SubGroupJourney> {
  return api.patch(`/subgroups/${id}`, data);
}

export async function deleteSubgroup(id: number | string): Promise<void> {
  return api.delete(`/subgroups/${id}`);
}
