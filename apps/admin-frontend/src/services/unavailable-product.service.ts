import { api } from "../lib/api/api-client";
import type {
  PaginatedResponse,
  UnavailableProduct,
  UnavailableProductStatus,
} from "../lib/entities";

export type UnavailableProductsParams = {
  page: number;
  limit: number;
  q?: string;
  status?: UnavailableProductStatus;
  sort?: "newest" | "oldest";
};

export const listUnavailableProducts = (params: UnavailableProductsParams) =>
  api.get<PaginatedResponse<UnavailableProduct>>("/unavailable-products", params);

export const getUnavailableProduct = (id: number) =>
  api.get<UnavailableProduct>(`/unavailable-products/${id}`);

export const updateUnavailableProduct = (
  id: number,
  data: { status?: UnavailableProductStatus; resolvedProductId?: number | null },
) => api.patch<UnavailableProduct>(`/unavailable-products/${id}`, data);

export const deleteUnavailableProduct = (id: number) =>
  api.delete<{ deleted: boolean }>(`/unavailable-products/${id}`);
