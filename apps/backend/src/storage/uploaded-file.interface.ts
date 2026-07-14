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
