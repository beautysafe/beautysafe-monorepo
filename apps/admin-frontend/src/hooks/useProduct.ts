import { useQuery } from '@tanstack/react-query';
import {
  listProducts,
  getProductById,
  getProductByEan,
  getProductsByCategory,
  getProductsBySubCategory,
  getProductsBySubSubCategory,
  getProductsByFlag,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/product.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '../lib/entities';

// --- Queries ---

export function useProducts(page: number, limit: number = 10) {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: () => listProducts(page, limit),
  });
}
export function useProductById(id: number | string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

export function useProductByEan(ean: string) {
  return useQuery({
    queryKey: ['productByEan', ean],
    queryFn: () => getProductByEan(ean),
    enabled: !!ean,
  });
}

export function useProductsByCategory(
  categoryId: number | string,
  page: number,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['productsByCategory', categoryId, page, limit],
    queryFn: () => getProductsByCategory(categoryId, page, limit),
    enabled: !!categoryId,
  });
}

export function useProductsBySubCategory(subCategoryId: number | string) {
  return useQuery({
    queryKey: ['productsBySubCategory', subCategoryId],
    queryFn: () => getProductsBySubCategory(subCategoryId),
    enabled: !!subCategoryId,
  });
}

export function useProductsBySubSubCategory(subSubCategoryId: number | string) {
  return useQuery({
    queryKey: ['productsBySubSubCategory', subSubCategoryId],
    queryFn: () => getProductsBySubSubCategory(subSubCategoryId),
    enabled: !!subSubCategoryId,
  });
}

export function useProductsByFlag(flagId: number | string) {
  return useQuery({
    queryKey: ['productsByFlag', flagId],
    queryFn: () => getProductsByFlag(flagId),
    enabled: !!flagId,
  });
}

// --- Mutations ---

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
