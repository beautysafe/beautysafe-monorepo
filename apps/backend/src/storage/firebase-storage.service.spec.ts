import { getApps } from 'firebase-admin/app';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';
import { DataSource } from 'typeorm';
import { FirebaseStorageService } from './firebase-storage.service';
import { UploadFolder } from './upload-folder.enum';

jest.mock('firebase-admin/app', () => ({
  applicationDefault: jest.fn(() => ({ type: 'applicationDefault' })),
  getApp: jest.fn(),
  getApps: jest.fn(),
  initializeApp: jest.fn(),
}));

jest.mock('firebase-admin/storage', () => ({
  getDownloadURL: jest.fn(),
  getStorage: jest.fn(),
}));

type SavedObject = {
  path: string;
  buffer: Buffer;
  options: Record<string, unknown>;
};

describe('FirebaseStorageService', () => {
  let saved: SavedObject[];
  let deleted: string[];
  let failPathPart: string | undefined;
  let service: FirebaseStorageService;

  beforeEach(() => {
    process.env.FIREBASE_STORAGE_BUCKET = 'test.firebasestorage.app';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:\\secrets\\firebase.json';
    saved = [];
    deleted = [];
    failPathPart = undefined;

    const bucket = {
      file: (path: string) => ({
        name: path,
        save: jest.fn((buffer: Buffer, options: Record<string, unknown>) => {
          if (failPathPart && path.includes(failPathPart)) {
            return Promise.reject(
              new Error('simulated Firebase write failure'),
            );
          }
          saved.push({ path, buffer, options });
          return Promise.resolve();
        }),
        delete: jest.fn(() => {
          deleted.push(path);
          return Promise.resolve();
        }),
      }),
    };

    (getApps as jest.Mock).mockReturnValue([{}]);
    (getStorage as jest.Mock).mockReturnValue({ bucket: () => bucket });
    (getDownloadURL as jest.Mock).mockImplementation(
      (object: { name: string }) =>
        Promise.resolve(`https://download.test/${object.name}`),
    );
    service = new FirebaseStorageService({} as DataSource);
  });

  const multerFile = (
    buffer: Buffer,
    mimetype = 'image/png',
  ): Express.Multer.File =>
    ({
      fieldname: 'file',
      originalname: 'original customer name.png',
      encoding: '7bit',
      mimetype,
      size: buffer.length,
      buffer,
    }) as Express.Multer.File;

  it('maps an upload response and sends required Firebase metadata', async () => {
    const result = await service.uploadImage(
      multerFile(Buffer.from('image bytes')),
      UploadFolder.BANNERS,
    );

    expect(result.url).toContain('https://download.test/banners/');
    expect(result.storagePath).toMatch(/^banners\/\d{4}\/\d{2}\//);
    expect(result.filename).toMatch(/\.png$/);
    expect(result.contentType).toBe('image/png');
    expect(result.size).toBe(11);
    expect(saved[0].options).toMatchObject({
      resumable: false,
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public,max-age=31536000,immutable',
        metadata: { originalName: 'original customer name.png' },
      },
    });
  });

  it('creates a bounded WebP original and a 400x400 WebP thumbnail', async () => {
    const input = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: '#ff00aa',
      },
    })
      .png()
      .toBuffer();

    const result = await service.uploadProductImage(multerFile(input));
    const original = saved.find((object) =>
      object.path.includes('/originals/'),
    );
    const thumbnail = saved.find((object) =>
      object.path.includes('/thumbnails/'),
    );
    expect(result.imagePath).toMatch(/^products\/originals\//);
    expect(result.thumbnailPath).toMatch(/^products\/thumbnails\//);
    expect(original).toBeDefined();
    expect(thumbnail).toBeDefined();

    const originalMetadata = await sharp(original?.buffer).metadata();
    const thumbnailMetadata = await sharp(thumbnail?.buffer).metadata();
    expect(originalMetadata).toMatchObject({
      format: 'webp',
      width: 800,
      height: 600,
    });
    expect(thumbnailMetadata).toMatchObject({
      format: 'webp',
      width: 400,
      height: 400,
    });
  });

  it('deletes the first product object when the second upload fails', async () => {
    const input = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 3,
        background: '#000000',
      },
    })
      .png()
      .toBuffer();
    failPathPart = '/thumbnails/';

    await expect(service.uploadProductImage(multerFile(input))).rejects.toThrow(
      'simulated Firebase write failure',
    );
    expect(deleted).toHaveLength(1);
    expect(deleted[0]).toContain('/originals/');
  });
});
