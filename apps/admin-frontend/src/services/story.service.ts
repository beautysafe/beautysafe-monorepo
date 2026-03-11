import type { Story } from '../lib/entities';
import { api } from '../lib/api/api-client';

export async function getStories(): Promise<Story[]> {
  return api.get('/stories');
}

export async function getStoryById(id: number | string): Promise<Story> {
  return api.get(`/stories/${id}`);
}

export async function createStory(data: Partial<Story>): Promise<Story> {
  return api.post('/stories', data);
}

export async function updateStory(
  id: number | string,
  data: Partial<Story>,
): Promise<Story> {
  return api.patch(`/stories/${id}`, data);
}

export async function deleteStory(id: number | string): Promise<void> {
  return api.delete(`/stories/${id}`);
}

