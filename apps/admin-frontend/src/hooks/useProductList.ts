import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductList } from '../lib/entities';
import {
  addProductListProducts,
  createProductList,
  deleteProductList,
  getProductListById,
  getProductListProducts,
  removeProductListProduct,
  updateProductList,
} from '../services/product-list.service';

export function useProductListById(id: number | string) {
  return useQuery({
    queryKey: ['product-list', id],
    queryFn: () => getProductListById(id),
    enabled: !!id,
  });
}

export function useProductListProducts(id: number | string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['product-list-products', id, page, limit],
    queryFn: () => getProductListProducts(id, page, limit),
    enabled: !!id,
  });
}

export function useCreateProductList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subgroupId,
      data,
    }: {
      subgroupId: number | string;
      data: Partial<ProductList>;
    }) => createProductList(subgroupId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['subgroup-product-lists'] }),
  });
}

export function useUpdateProductList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<ProductList> }) =>
      updateProductList(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['subgroup-product-lists'] }),
  });
}

export function useDeleteProductList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteProductList(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['subgroup-product-lists'] }),
  });
}

export function useAddProductListProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: { ean?: string; eans?: string[] };
    }) => addProductListProducts(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-list'] });
      queryClient.invalidateQueries({ queryKey: ['product-list-products'] });
    },
  });
}

export function useRemoveProductListProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      productId,
    }: {
      id: number | string;
      productId: number | string;
    }) => removeProductListProduct(id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-list'] });
      queryClient.invalidateQueries({ queryKey: ['product-list-products'] });
    },
  });
}
