import { api } from "../lib/api/api-client";
import type { PaginatedResponse, ProductFeedback } from "../lib/entities";

export type ProductFeedbackParams = {
  page: number;
  limit: number;
  q?: string;
  productId?: number;
  sort?: "newest" | "oldest";
};

export const listProductFeedback = (params: ProductFeedbackParams) =>
  api.get<PaginatedResponse<ProductFeedback>>("/product-feedback", params);

export const deleteProductFeedback = (id: number) =>
  api.delete<{ deleted: boolean }>(`/product-feedback/${id}`);
