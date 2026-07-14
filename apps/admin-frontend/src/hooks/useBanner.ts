import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateBannerPayload, UpdateBannerPayload } from "../lib/entities";
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "../services/banner.service";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => getBanners(),
  });
}

export function useBannerById(id: number | string) {
  return useQuery({
    queryKey: ["banner", id],
    queryFn: () => getBannerById(id),
    enabled: !!id,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerPayload) => createBanner(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateBannerPayload;
    }) => updateBanner(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banner", variables.id] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });
}
