import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SubGroupJourney } from '../lib/entities';
import {
  createSubgroup,
  deleteSubgroup,
  getSubgroupById,
  getSubgroupJourneys,
  getSubgroupProductLists,
  listSubgroups,
  updateSubgroup,
} from '../services/subgroup.service';

export function useSubgroups() {
  return useQuery({ queryKey: ['subgroups'], queryFn: listSubgroups });
}

export function useSubgroupById(id: number | string) {
  return useQuery({
    queryKey: ['subgroup', id],
    queryFn: () => getSubgroupById(id),
    enabled: !!id,
  });
}

export function useSubgroupProductLists(id: number | string) {
  return useQuery({
    queryKey: ['subgroup-product-lists', id],
    queryFn: () => getSubgroupProductLists(id),
    enabled: !!id,
  });
}

export function useSubgroupJourneys(id: number | string) {
  return useQuery({
    queryKey: ['subgroup-journeys', id],
    queryFn: () => getSubgroupJourneys(id),
    enabled: !!id,
  });
}

export function useCreateSubgroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: number | string;
      data: Partial<SubGroupJourney>;
    }) => createSubgroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-subgroups'] });
    },
  });
}

export function useUpdateSubgroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: Partial<SubGroupJourney>;
    }) => updateSubgroup(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subgroups'] }),
  });
}

export function useDeleteSubgroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteSubgroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subgroups'] });
      queryClient.invalidateQueries({ queryKey: ['group-subgroups'] });
    },
  });
}
