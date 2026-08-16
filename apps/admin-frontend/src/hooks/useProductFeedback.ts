import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteProductFeedback,
  listProductFeedback,
  type ProductFeedbackParams,
} from "../services/product-feedback.service";

export const useProductFeedback = (params: ProductFeedbackParams) =>
  useQuery({
    queryKey: ["product-feedback", params],
    queryFn: () => listProductFeedback(params),
  });

export const useDeleteProductFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductFeedback,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["product-feedback"] }),
  });
};
