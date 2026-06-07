import type { PaginatedProductsResponse, ProductList } from '../lib/entities';
import { api } from '../lib/api/api-client';

export async function getProductListById(id: number | string): Promise<ProductList> {
  return api.get(`/product-lists/${id}`);
}

export async function createProductList(
  subgroupId: number | string,
  data: Partial<ProductList>,
): Promise<ProductList> {
  return api.post(`/subgroups/${subgroupId}/product-lists`, data);
}

export async function updateProductList(
  id: number | string,
  data: Partial<ProductList>,
): Promise<ProductList> {
  return api.patch(`/product-lists/${id}`, data);
}

export async function deleteProductList(id: number | string): Promise<void> {
  return api.delete(`/product-lists/${id}`);
}

export async function getProductListProducts(
  id: number | string,
  page = 1,
  limit = 20,
): Promise<PaginatedProductsResponse> {
  return api.get(`/product-lists/${id}/products?page=${page}&limit=${limit}`);
}

export async function addProductListProducts(
  id: number | string,
  data: { ean?: string; eans?: string[] },
): Promise<ProductList> {
  return api.post(`/product-lists/${id}/products`, data);
}

export async function removeProductListProduct(
  id: number | string,
  productId: number | string,
): Promise<ProductList> {
  return api.delete(`/product-lists/${id}/products/${productId}`);
}
