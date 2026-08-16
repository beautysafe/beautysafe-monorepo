import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUnavailableProduct,
  listUnavailableProducts,
  updateUnavailableProduct,
  type UnavailableProductsParams,
} from "../services/unavailable-product.service";
import type { UnavailableProductStatus } from "../lib/entities";

export const useUnavailableProducts = (params: UnavailableProductsParams) =>
  useQuery({
    queryKey: ["unavailable-products", params],
    queryFn: () => listUnavailableProducts(params),
  });

export const useUpdateUnavailableProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolvedProductId,
    }: {
      id: number;
      status?: UnavailableProductStatus;
      resolvedProductId?: number | null;
    }) => updateUnavailableProduct(id, { status, resolvedProductId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["unavailable-products"] }),
  });
};

export const useDeleteUnavailableProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUnavailableProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["unavailable-products"] }),
  });
};
