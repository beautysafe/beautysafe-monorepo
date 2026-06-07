import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Group } from '../lib/entities';
import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroupSubgroups,
  listGroups,
  updateGroup,
} from '../services/group.service';

export function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: listGroups });
}

export function useGroupById(id: number | string) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroupById(id),
    enabled: !!id,
  });
}

export function useGroupSubgroups(id: number | string) {
  return useQuery({
    queryKey: ['group-subgroups', id],
    queryFn: () => getGroupSubgroups(id),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Group>) => createGroup(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Group> }) =>
      updateGroup(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}
