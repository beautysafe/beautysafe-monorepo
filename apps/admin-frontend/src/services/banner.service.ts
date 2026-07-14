import type {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "../lib/entities";
import { api } from "../lib/api/api-client";

export async function getBanners(): Promise<Banner[]> {
  return api.get("/banners");
}

export async function getBannerById(id: number | string): Promise<Banner> {
  return api.get(`/banners/${id}`);
}

export async function createBanner(data: CreateBannerPayload): Promise<Banner> {
  return api.post("/banners", data);
}

export async function updateBanner(
  id: number | string,
  data: UpdateBannerPayload,
): Promise<Banner> {
  return api.patch(`/banners/${id}`, data);
}

export async function deleteBanner(id: number | string): Promise<void> {
  return api.delete(`/banners/${id}`);
}
