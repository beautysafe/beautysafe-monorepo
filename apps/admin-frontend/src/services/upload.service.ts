import { api, axiosInstance } from '../lib/api/api-client';

export type UploadFolder =
  | 'products'
  | 'banners'
  | 'stories'
  | 'story-videos'
  | 'groups'
  | 'subgroups'
  | 'avatars';

export interface UploadedFile {
  url: string;
  storagePath: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface UploadedProductImage {
  imageUrl: string;
  imagePath: string;
  thumbnailUrl: string;
  thumbnailPath: string;
}

type ProgressCallback = (percent: number) => void;

const progressHandler = (onProgress?: ProgressCallback) =>
  onProgress
    ? (event: { loaded: number; total?: number }) => {
        if (event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      }
    : undefined;

export async function uploadImage(
  file: File,
  folder: UploadFolder,
  onProgress?: ProgressCallback,
): Promise<UploadedFile> {
  const data = new FormData();
  data.append('file', file);
  data.append('folder', folder);
  const response = await axiosInstance.post<UploadedFile>('/uploads/images', data, {
    onUploadProgress: progressHandler(onProgress),
  });
  return response.data;
}

export async function uploadProductImage(
  file: File,
  onProgress?: ProgressCallback,
): Promise<UploadedProductImage> {
  const data = new FormData();
  data.append('file', file);
  const response = await axiosInstance.post<UploadedProductImage>(
    '/uploads/product-images',
    data,
    { onUploadProgress: progressHandler(onProgress) },
  );
  return response.data;
}

export async function uploadVideo(
  file: File,
  folder: UploadFolder,
  onProgress?: ProgressCallback,
): Promise<UploadedFile> {
  const data = new FormData();
  data.append('file', file);
  data.append('folder', folder);
  const response = await axiosInstance.post<UploadedFile>('/uploads/videos', data, {
    onUploadProgress: progressHandler(onProgress),
  });
  return response.data;
}

export function deleteUploadedFile(storagePath: string): Promise<{ deleted: boolean }> {
  return api.delete('/uploads', { storagePath });
}
