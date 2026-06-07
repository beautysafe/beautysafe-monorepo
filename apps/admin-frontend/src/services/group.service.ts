import type { Group, SubGroupJourney } from '../lib/entities';
import { api } from '../lib/api/api-client';

export async function listGroups(): Promise<Group[]> {
  return api.get('/groups');
}

export async function getGroupById(id: number | string): Promise<Group> {
  return api.get(`/groups/${id}`);
}

export async function getGroupSubgroups(id: number | string): Promise<SubGroupJourney[]> {
  return api.get(`/groups/${id}/subgroups`);
}

export async function createGroup(data: Partial<Group>): Promise<Group> {
  return api.post('/groups', data);
}

export async function updateGroup(id: number | string, data: Partial<Group>): Promise<Group> {
  return api.patch(`/groups/${id}`, data);
}

export async function deleteGroup(id: number | string): Promise<void> {
  return api.delete(`/groups/${id}`);
}
