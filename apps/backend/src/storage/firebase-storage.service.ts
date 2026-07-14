import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { DataSource } from 'typeorm';
import { Banner } from '../banners/entities/banner.entity';
import { Group } from '../groups/entities/group.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { Story } from '../stories/entities/story.entity';
import { SubGroup } from '../subgroups/entities/subgroup.entity';
import { User } from '../users/entities/user.entity';
import sharp from 'sharp';
import {
  buildProductStoragePaths,
  buildStoragePath,
  validateImageFile,
  validateStoragePath,
  validateUploadFolder,
  validateVideoFile,
} from './file-validation';
import { UploadFolder } from './upload-folder.enum';
import { UploadedFile, UploadedProductImage } from './uploaded-file.interface';

const CACHE_CONTROL = 'public,max-age=31536000,immutable';

@Injectable()
export class FirebaseStorageService {
  private readonly logger = new Logger(FirebaseStorageService.name);
  private readonly bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>;

  constructor(private readonly dataSource: DataSource) {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET?.trim();
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
    const missing = [
      !bucketName && 'FIREBASE_STORAGE_BUCKET',
      !credentialsPath && 'GOOGLE_APPLICATION_CREDENTIALS',
    ].filter(Boolean);

    if (missing.length) {
      throw new Error(
        `Firebase Storage configuration error: missing ${missing.join(', ')}`,
      );
    }

    const [existingApp] = getApps();
    const app =
      existingApp ??
      initializeApp({
        credential: applicationDefault(),
        storageBucket: bucketName,
      });
    this.bucket = getStorage(app).bucket(bucketName);
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadedFile> {
    const extension = validateImageFile(file);
    const safeFolder = validateUploadFolder(folder);
    return this.uploadBuffer(
      file.buffer,
      buildStoragePath(safeFolder, extension),
      file.mimetype,
      file.originalname,
    );
  }

  async uploadProductImage(
    file: Express.Multer.File,
  ): Promise<UploadedProductImage> {
    validateImageFile(file);
    const { imagePath, thumbnailPath } = buildProductStoragePaths();
    const uploadedPaths: string[] = [];

    try {
      const [imageBuffer, thumbnailBuffer] = await Promise.all([
        sharp(file.buffer)
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer(),
        sharp(file.buffer)
          .rotate()
          .resize(400, 400, { fit: 'cover' })
          .webp({ quality: 78 })
          .toBuffer(),
      ]);

      const image = await this.uploadBuffer(
        imageBuffer,
        imagePath,
        'image/webp',
        file.originalname,
      );
      uploadedPaths.push(imagePath);
      const thumbnail = await this.uploadBuffer(
        thumbnailBuffer,
        thumbnailPath,
        'image/webp',
        file.originalname,
      );
      uploadedPaths.push(thumbnailPath);

      return {
        imageUrl: image.url,
        imagePath,
        thumbnailUrl: thumbnail.url,
        thumbnailPath,
      };
    } catch (error) {
      await Promise.all(uploadedPaths.map((path) => this.deleteObject(path)));
      throw error;
    }
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadedFile> {
    const extension = validateVideoFile(file);
    const safeFolder = validateUploadFolder(folder);
    return this.uploadBuffer(
      file.buffer,
      buildStoragePath(safeFolder, extension),
      file.mimetype,
      file.originalname,
    );
  }

  async deleteFile(storagePath: string): Promise<void> {
    const safePath = validateStoragePath(storagePath);
    if (await this.isReferenced(safePath)) {
      throw new ConflictException(
        'The Firebase object is still referenced by a database record',
      );
    }
    await this.bucket.file(safePath).delete({ ignoreNotFound: true });
  }

  private async uploadBuffer(
    buffer: Buffer,
    storagePath: string,
    contentType: string,
    originalName: string,
  ): Promise<UploadedFile> {
    const object = this.bucket.file(storagePath);
    let saved = false;
    let url: string;
    try {
      await object.save(buffer, {
        resumable: false,
        metadata: {
          contentType,
          cacheControl: CACHE_CONTROL,
          metadata: {
            originalName,
            firebaseStorageDownloadTokens: randomUUID(),
          },
        },
      });
      saved = true;
      url = await getDownloadURL(object);
    } catch (error) {
      if (saved) await this.deleteObject(storagePath);
      throw error;
    }
    return {
      url,
      storagePath,
      filename: storagePath.split('/').at(-1) as string,
      contentType,
      size: buffer.length,
    };
  }

  private async deleteObject(storagePath: string): Promise<void> {
    try {
      await this.bucket.file(storagePath).delete({ ignoreNotFound: true });
    } catch (error) {
      this.logger.error(
        `Failed to roll back Firebase object ${storagePath}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async isReferenced(storagePath: string): Promise<boolean> {
    const [banner, storyImage, storyVideo, group, subgroup, product, user] =
      await Promise.all([
        this.dataSource.getRepository(Banner).exist({
          where: { imageKey: storagePath },
        }),
        this.dataSource.getRepository(Story).exist({
          where: { imageKey: storagePath },
        }),
        this.dataSource
          .getRepository(Story)
          .createQueryBuilder('story')
          .where(':storagePath = ANY(story."videoKeys")', { storagePath })
          .getExists(),
        this.dataSource.getRepository(Group).exist({
          where: { imageKey: storagePath },
        }),
        this.dataSource.getRepository(SubGroup).exist({
          where: { imageKey: storagePath },
        }),
        this.dataSource
          .getRepository(ProductImage)
          .createQueryBuilder('image')
          .where('image."imageKey" = :storagePath', { storagePath })
          .orWhere('image."thumbnailKey" = :storagePath', { storagePath })
          .getExists(),
        this.dataSource.getRepository(User).exist({
          where: { avatarKey: storagePath },
        }),
      ]);
    return (
      banner || storyImage || storyVideo || group || subgroup || product || user
    );
  }
}
