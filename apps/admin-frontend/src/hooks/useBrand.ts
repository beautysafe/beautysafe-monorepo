import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  searchBrands,
} from '../services/brand.service';
import type { Brand } from '../lib/entities';

export function useBrands(page: number, limit: number = 20) {
  return useQuery({ 
    queryKey: ['brands', page, limit], 
    queryFn: () => listBrands(page, limit) 
  });
}

export function useBrandById(id: number | string) {
  return useQuery({ queryKey: ['brand', id], queryFn: () => getBrandById(id), enabled: !!id });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Brand>) => createBrand(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Brand> }) => updateBrand(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteBrand(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });
}

export function useSearchBrands(q: string) {
  return useQuery({
    queryKey: ['brandsSearch', q],
    queryFn: () => searchBrands(q),
    enabled: !!q,
  });
}
