import type { Brand } from '../lib/entities';
import { api } from '../lib/api/api-client';

export async function listBrands(page: number = 1, limit: number = 20): Promise<Brand[]> {
  return api.get(`/brands?page=${page}&limit=${limit}`);
}

export async function getBrandById(id: number | string): Promise<Brand> {
  return api.get(`/brands/${id}`);
}

export async function createBrand(data: Partial<Brand>): Promise<Brand> {
  return api.post('/brands', data);
}

export async function updateBrand(id: number | string, data: Partial<Brand>): Promise<Brand> {
  return api.patch(`/brands/${id}`, data);
}

export async function deleteBrand(id: number | string): Promise<void> {
  return api.delete(`/brands/${id}`);
}

export async function searchBrands(q: string): Promise<Brand[]> {
  return api.get(`/brands/search?q=${encodeURIComponent(q)}`);
}
