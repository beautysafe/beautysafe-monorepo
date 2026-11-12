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
  searchIngredientsPage,
} from "../services/ingredient.service";
import type { Ingredient } from "../lib/entities";
import { useEffect, useState } from "react";

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);
  return debouncedValue;
}

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
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearchPage"] });
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
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearchPage"] });
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
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearchPage"] });
    },
  });
}

export function useSearchIngredients(
  query: string,
  status?: Ingredient["status"],
) {
  const debouncedQuery = useDebouncedValue(query.trim());
  return useQuery({
    queryKey: ["ingredientsSearch", debouncedQuery, status],
    queryFn: () => searchIngredients(debouncedQuery, status),
    enabled: Boolean(debouncedQuery),
  });
}

export function useSearchIngredientsPage(
  query: string,
  status: Ingredient["status"],
  page: number,
  limit: number,
) {
  const debouncedQuery = useDebouncedValue(query.trim());
  return useQuery({
    queryKey: ["ingredientsSearchPage", debouncedQuery, status, page, limit],
    queryFn: () => searchIngredientsPage(debouncedQuery, status, page, limit),
    enabled: Boolean(debouncedQuery),
  });
}

export function useResolveIngredients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (names: string[]) => resolveIngredients(names),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearch"] });
      queryClient.invalidateQueries({ queryKey: ["ingredientsSearchPage"] });
    },
  });
}
