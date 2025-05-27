import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../services/product.service';
import { getProductById } from '../services/product.service';
import { getProductByEan } from '../services/product.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../services/product.service';
import { updateProduct } from '../services/product.service';
import { deleteProduct } from '../services/product.service';
import type { Product } from '../lib/entities/product.entity';


export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
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