import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { posix } from 'path';
import { UploadFolder } from './upload-folder.enum';

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export const IMAGE_MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const VIDEO_MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

export function validateUploadFolder(value: unknown): UploadFolder {
  if (
    typeof value !== 'string' ||
    !Object.values(UploadFolder).includes(value as UploadFolder)
  ) {
    throw new BadRequestException('Invalid upload folder');
  }

  return value as UploadFolder;
}

function validateFile(
  file: Express.Multer.File | undefined,
  mimeExtensions: Readonly<Record<string, string>>,
  maximumSize: number,
  label: string,
): string {
  if (!file) {
    throw new BadRequestException('File is required');
  }
  if (!file.buffer?.length || file.size <= 0) {
    throw new BadRequestException('File must not be empty');
  }
  const extension = mimeExtensions[file.mimetype];
  if (!extension) {
    throw new BadRequestException(`Unsupported ${label} MIME type`);
  }
  if (file.size > maximumSize) {
    throw new BadRequestException(
      `${label[0].toUpperCase()}${label.slice(1)} exceeds the maximum allowed size`,
    );
  }
  return extension;
}

export function validateImageFile(file?: Express.Multer.File): string {
  return validateFile(file, IMAGE_MIME_EXTENSIONS, MAX_IMAGE_SIZE, 'image');
}

export function validateVideoFile(file?: Express.Multer.File): string {
  return validateFile(file, VIDEO_MIME_EXTENSIONS, MAX_VIDEO_SIZE, 'video');
}

export function buildStoragePath(
  folder: UploadFolder,
  extension: string,
  now = new Date(),
): string {
  validateUploadFolder(folder);
  if (!/^[a-z0-9]+$/i.test(extension)) {
    throw new BadRequestException('Invalid file extension');
  }
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${folder}/${year}/${month}/${randomUUID()}.${extension.toLowerCase()}`;
}

export function buildProductStoragePaths(now = new Date()): {
  imagePath: string;
  thumbnailPath: string;
} {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const id = randomUUID();
  return {
    imagePath: `products/originals/${year}/${month}/${id}.webp`,
    thumbnailPath: `products/thumbnails/${year}/${month}/${id}.webp`,
  };
}

const UUID_FILE =
  '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const NORMAL_PATH = new RegExp(
  `^(${Object.values(UploadFolder).join('|')})/\\d{4}/(0[1-9]|1[0-2])/${UUID_FILE}\\.[a-z0-9]+$`,
  'i',
);
const PRODUCT_PATH = new RegExp(
  `^products/(originals|thumbnails)/\\d{4}/(0[1-9]|1[0-2])/${UUID_FILE}\\.webp$`,
  'i',
);

export function validateStoragePath(storagePath: unknown): string {
  if (typeof storagePath !== 'string' || !storagePath.trim()) {
    throw new BadRequestException('storagePath is required');
  }
  const value = storagePath.trim();
  if (
    value.includes('://') ||
    value.includes('\\') ||
    value.includes('\0') ||
    value.startsWith('/') ||
    value.includes('//')
  ) {
    throw new BadRequestException('Invalid storage path');
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new BadRequestException('Invalid storage path encoding');
  }
  if (decoded !== value || decoded.split('/').some((part) => part === '..')) {
    throw new BadRequestException('Invalid storage path');
  }
  if (posix.normalize(value) !== value) {
    throw new BadRequestException('Invalid storage path');
  }
  if (!NORMAL_PATH.test(value) && !PRODUCT_PATH.test(value)) {
    throw new BadRequestException('Storage path is not an allowed upload path');
  }
  return value;
}
