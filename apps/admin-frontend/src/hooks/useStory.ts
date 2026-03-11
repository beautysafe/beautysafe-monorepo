import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Story } from '../lib/entities';
import {
  createStory,
  deleteStory,
  getStories,
  getStoryById,
  updateStory,
} from '../services/story.service';

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => getStories(),
  });
}

export function useStoryById(id: number | string) {
  return useQuery({
    queryKey: ['story', id],
    queryFn: () => getStoryById(id),
    enabled: !!id,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Story>) => createStory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Story> }) =>
      updateStory(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteStory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
  });
}

