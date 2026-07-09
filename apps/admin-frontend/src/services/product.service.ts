import { api } from '../lib/api/api-client';
import type { PaginatedProductsResponse, Product, ProductsByFlagResponse } from '../lib/entities';

// Create product
export const createProduct = (data: Partial<Product>) =>
  api.post<Product, Partial<Product>>('/products', data);

// List all products
export const listProducts = (page = 1, limit = 10) =>
  api.get<{ data: Product[]; total: number; page: number; limit: number }>(
    `/products?page=${page}&limit=${limit}`
  );

// Get product by ID
export const getProductById = (id: number | string) =>
  api.get<Product>(`/products/${id}`);

// Update product
export const updateProduct = (id: number | string, data: Partial<Product>) =>
  api.patch<Product, Partial<Product>>(`/products/${id}`, data);

// Delete product
export const deleteProduct = (id: number | string) =>
  api.delete<void>(`/products/${id}`);

// Get product by EAN
export const getProductByEan = (ean: string) =>
  api.get<Product>(`/products/ean/${ean}`);

// Get products by Category
export const getProductsByCategory = (
  categoryId: number | string,
  page = 1,
  limit = 10
) =>
  api.get<{ data: Product[]; total: number; page: number; pageCount: number }>(
    `/products/category/${categoryId}?page=${page}&limit=${limit}`
  );

// Get products by SubCategory
export const getProductsBySubCategory = (subCategoryId: number | string) =>
  api.get<Product[]>(`/products/subcategory/${subCategoryId}`);

// Get products by SubSubCategory
export const getProductsBySubSubCategory = (subSubCategoryId: number | string) =>
  api.get<Product[]>(`/products/subsubcategory/${subSubCategoryId}`);

// Get products by Flag
export const getProductsByFlag = (
  flagId: number | string,
  page = 1,
  limit = 10
) =>
  api.get<ProductsByFlagResponse>(
    `/products/flag/${flagId}?limit=${limit}&page=${page}`
  );

// Get products by Brand 
export const getProductsByBrand = (
  brandId: number | string,
  page = 1,
  limit = 10
) =>
  api.get<{ data: Product[]; total: number; page: number; pageCount: number }>(
    `/products/brand/${brandId}?page=${page}&limit=${limit}`
  );

export type SearchProductsParams = {
  brandIds?: number[];
  categoryIds?: number[];
  subCategoryIds?: number[];
  subSubCategoryIds?: number[];
  includeIngredientIds?: number[];
  excludeIngredientIds?: number[];
  requireAllIngredients?: boolean;
  flagIds?: number[];
  requireAllFlags?: boolean;
  minScore?: number;
  maxScore?: number;
  page: number;
  limit: number;
};

const serializeSearchParams = (params: SearchProductsParams) =>
  Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null;
      })
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value])
  );

export const searchProducts = (params: SearchProductsParams) =>
  api.get<PaginatedProductsResponse>("/products/search", serializeSearchParams(params));
