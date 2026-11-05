import type { Ingredient } from "../lib/entities";
import { api } from "../lib/api/api-client";

export async function listIngredients(
  page: number = 1,
  limit: number = 20,
  status: Ingredient["status"] = "ACTIVE",
): Promise<Ingredient[]> {
  return api.get(`/ingredients?page=${page}&limit=${limit}&status=${status}`);
}

export async function listNewIngredients(
  page: number = 1,
  limit: number = 20,
): Promise<Ingredient[]> {
  return api.get(`/ingredients/new?page=${page}&limit=${limit}`);
}

export async function getIngredientById(
  id: number | string,
): Promise<Ingredient> {
  return api.get(`/ingredients/${id}`);
}

export async function createIngredient(
  data: Partial<Ingredient>,
): Promise<Ingredient> {
  return api.post("/ingredients", data);
}

export async function updateIngredient(
  id: number | string,
  data: Partial<Ingredient>,
): Promise<Ingredient> {
  return api.patch(`/ingredients/${id}`, data);
}

export async function deleteIngredient(id: number | string): Promise<void> {
  return api.delete(`/ingredients/${id}`);
}

export async function searchIngredients(
  nameQuery: string,
  officialNameQuery?: string,
  status?: Ingredient["status"],
): Promise<Ingredient[]> {
  return api.get("/ingredients/search", {
    ...(nameQuery?.trim() ? { name: nameQuery } : {}),
    ...(officialNameQuery?.trim() ? { officialName: officialNameQuery } : {}),
    ...(status ? { status } : {}),
  });
}

export async function resolveIngredients(
  names: string[],
): Promise<Ingredient[]> {
  return api.post("/ingredients/resolve", { names });
}
