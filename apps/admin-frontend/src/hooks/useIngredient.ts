import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  searchIngredients,
  listNewIngredients,
  resolveIngredients,
} from "../services/ingredient.service";
import type { Ingredient } from "../lib/entities";

export function useIngreddients(
  page: number,
  limit: number = 20,
  status: Ingredient["status"] = "ACTIVE",
) {
  return useQuery({
    queryKey: ["ingredients", status, page, limit],
    queryFn: () =>
      status === "NEW"
        ? listNewIngredients(page, limit)
        : listIngredients(page, limit, status),
  });
}

export function useIngredientById(id: number | string) {
  return useQuery({
    queryKey: ["ingredient", id],
    queryFn: () => getIngredientById(id),
    enabled: !!id,
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Ingredient>) => createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearch"] });
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: Partial<Ingredient>;
    }) => updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearch"] });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearch"] });
    },
  });
}

export function useSearchIngredients(q: string, status?: Ingredient["status"]) {
  return useQuery({
    queryKey: ["ingredientsSearch", q, status],
    queryFn: () => searchIngredients(q, status),
    enabled: !!q,
  });
}

export function useResolveIngredients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (names: string[]) => resolveIngredients(names),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearch"] });
    },
  });
}
